import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

const retailer = '20000000-0000-4000-8000-000000000001';
const stranger = '20000000-0000-4000-8000-000000000002';
const owner = '20000000-0000-4000-8000-000000000003';

const db = await PGlite.create();
await db.exec(`
  create role anon;
  create role authenticated;
  create role service_role bypassrls;
  create schema auth;
  create schema storage;
  create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
  $$;
  grant usage on schema auth, storage to anon, authenticated, service_role;
  grant execute on function auth.uid(), auth.jwt() to anon, authenticated, service_role;
  create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text);
  alter table storage.objects enable row level security;
  grant select, insert, update, delete on storage.objects to authenticated;
`);
for (const file of [
  '20261013193632_business_platform_foundation.sql',
  '20261013202511_retailer_application_submission.sql',
  '20261015065631_owner_dashboard.sql',
  '20261016080000_restrict_rls_event_trigger_execution.sql',
  '20261016090000_trade_quote_requests.sql',
]) {
  await db.exec(await fs.readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
}
await db.exec(`
  insert into auth.users(id, email, email_confirmed_at) values
    ('${retailer}', 'retailer@example.test', now()),
    ('${stranger}', 'stranger@example.test', now()),
    ('${owner}', 'owner@example.test', now());
  insert into public.user_roles(user_id, role) values ('${owner}', 'admin');
`);

async function as(role, id, fn) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${id ?? ''}', false)`);
  try { return await fn(); } finally { await db.exec('reset role'); }
}

test('trade quote migration preserves existing company settings and enables RLS', async () => {
  const settings = await db.query('select count(*)::int as n from public.company_settings');
  assert.equal(settings.rows[0].n, 1);
  const table = await db.query("select rowsecurity from pg_tables where schemaname='public' and tablename='trade_quote_requests'");
  assert.equal(table.rows[0].rowsecurity, true);
});

test('a retailer sees only their quotes; an owner can review them', async () => {
  let quoteId;
  await as('service_role', null, async () => {
    const result = await db.query(`insert into public.trade_quote_requests
      (user_id, idempotency_key, business_name, items, subtotal_pence, vat_pence, estimated_total_pence)
      values ($1, gen_random_uuid(), 'Test Flooring Ltd', '[{"slug":"ashford-natural-oak-engineered","packs":10}]'::jsonb, 10000, 2000, 12000)
      returning id`, [retailer]);
    quoteId = result.rows[0].id;
  });
  await as('authenticated', retailer, async () => {
    const own = await db.query('select id from public.trade_quote_requests');
    assert.equal(own.rows.length, 1);
    assert.equal(own.rows[0].id, quoteId);
    const changed = await db.query("update public.trade_quote_requests set status='approved' where id=$1 returning id", [quoteId]);
    assert.equal(changed.rows.length, 0);
  });
  await as('authenticated', stranger, async () => {
    assert.equal((await db.query('select id from public.trade_quote_requests')).rows.length, 0);
    assert.equal((await db.query("update public.trade_quote_requests set status='approved' where id=$1 returning id", [quoteId])).rows.length, 0);
  });
  await as('authenticated', owner, async () => {
    const changed = await db.query("update public.trade_quote_requests set status='approved' where id=$1 returning status", [quoteId]);
    assert.equal(changed.rows[0].status, 'approved');
  });
});

test.after(() => db.close());
