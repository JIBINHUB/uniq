import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

const owner='10000000-0000-4000-8000-000000000001',retailer='10000000-0000-4000-8000-000000000002',developer='10000000-0000-4000-8000-000000000003',outsider='10000000-0000-4000-8000-000000000004';
const db=await PGlite.create();
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
create schema auth;create schema storage;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth,storage to anon,authenticated,service_role;
grant execute on function auth.uid(),auth.jwt() to anon,authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
alter table storage.objects enable row level security;
grant select,insert,update,delete on storage.objects to authenticated;
`);
for(const file of ['20261013193632_business_platform_foundation.sql','20261013202511_retailer_application_submission.sql','20261015065631_owner_dashboard.sql'])await db.exec(await fs.readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
await db.exec(`insert into auth.users values('${owner}','owner@example.test',now()),('${retailer}','retailer@example.test',now()),('${developer}','developer@example.test',now()),('${outsider}','outsider@example.test',now()); insert into public.user_roles(user_id,role) values('${owner}','admin');`);
async function as(role,id,fn){const email=({[owner]:'owner@example.test',[retailer]:'retailer@example.test',[developer]:'developer@example.test',[outsider]:'outsider@example.test'})[id]||'';await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub','${id||''}',false);select set_config('request.jwt.claims','{"role":"${role}","email":"${email}"}',false);`);try{return await fn();}finally{await db.exec('reset role;');}}
const one=async(sql,args=[])=> (await db.query(sql,args)).rows[0];

test('migration imports 12 floors and 80 ranges, every public table has RLS',async()=>{
 assert.equal(Number((await one('select count(*) as n from public.products')).n),12);
 assert.equal(Number((await one('select count(*) as n from public.manufacturer_ranges')).n),80);
 assert.equal(Number((await one("select count(*) as n from pg_tables where schemaname='public' and not rowsecurity")).n),0);
});
test('anonymous clients can read published products but not private records or drafts',async()=>{
 await as('anon',null,async()=>{
 assert.equal(Number((await one('select count(*) as n from public.products')).n),12);
 await assert.rejects(db.query('select * from public.customers'),/permission denied/);
 await assert.rejects(db.query('select draft from public.site_content'),/permission denied/);
 await assert.rejects(db.query('select public.owner_content()'),/permission denied/);
 await assert.rejects(db.query('select public.owner_pin_attempt()'),/permission denied/);
 });
});
test('authenticated customers cannot change products, approve retailers or claim uninvited staff access',async()=>{
 await as('authenticated',outsider,async()=>{
 assert.equal((await db.query("update public.products set name='Compromised' returning id")).rows.length,0);
 await assert.rejects(db.query("select public.review_retailer(gen_random_uuid(),'approved','')"),/Owner access required/);
 await assert.rejects(db.query('select public.claim_staff_access()'),/No staff invitation/);
 await assert.rejects(db.query('select public.owner_content()'),/Owner access required/);
 await assert.rejects(db.query('select draft from public.site_content'),/permission denied/);
 });
});
test('owner product saves are atomic and approved prices become publicly readable',async()=>{
 const c=await one("select id from public.categories where slug='engineered'");
 const payload={slug:'test-owner-floor',name:'Owner test floor',category_id:c.id,description:'Test',brand:'UNIQ',sku:'TEST-OWNER',colour:'Oak',material:'Oak',finish:'Matt',thickness:'14mm',dimensions:'190x1900',wear_layer:'3mm',installation:'Click',warranty:'',pack_coverage:2.4,availability:'in_stock',status:'published',badge:'New',tags:['oak'],compare_at_pence:4500,stock_packs:12,reorder_level:5,warehouse_location:'A1',supplier:'Test',stock_confirmed:true,price_pence:3999,vat_basis_points:2000,images:[{url:'/test.webp',alt:'Floor'}]};
 await as('authenticated',owner,async()=>{
 const saved=await one('select public.save_owner_product($1::jsonb) as id',[JSON.stringify(payload)]);payload.id=saved.id;
 assert.equal(Number((await one('select stock_packs from public.products where id=$1',[saved.id])).stock_packs),12);
 await assert.rejects(db.query('select public.save_owner_product($1::jsonb)',[JSON.stringify({...payload,name:'Should roll back',price_pence:-1})]),/check constraint/);
 assert.equal((await one('select name from public.products where id=$1',[saved.id])).name,'Owner test floor');
 });
 await as('anon',null,async()=>{assert.equal(Number((await one('select amount_pence from public.product_prices where product_id=$1',[payload.id])).amount_pence),3999);});
});
test('retailer approval grants a profile and role together; suspension revokes trade access',async()=>{
 let id;await as('authenticated',retailer,async()=>{
 id=(await one("insert into public.retailer_applications(user_id,business_name,contact_name,email,phone,business_type,address,city,postcode,idempotency_key) values($1,'Test Ltd','Test Retailer','retailer@example.test','07700000000','Installer','1 Test St','London','SW1A 1AA',gen_random_uuid()) returning id",[retailer])).id;
 });
 await as('authenticated',owner,async()=>{
 await db.query("select public.review_retailer($1,'approved','Verified business')",[id]);
 assert.equal((await one('select status from public.retailer_profiles where user_id=$1',[retailer])).status,'approved');
 await db.query("select public.review_retailer($1,'suspended','Suspended for testing')",[id]);
 assert.equal((await one('select status from public.retailer_profiles where user_id=$1',[retailer])).status,'suspended');
 });
 assert.equal((await one('select role from public.user_roles where user_id=$1',[retailer])).role,'customer');
});
test('developer invitations grant preview membership only and revocation disables it',async()=>{
 let invite;await as('authenticated',owner,async()=>{invite=(await one("insert into public.staff_invitations(email,access) values('developer@example.test','developer') returning id")).id;});
 await as('authenticated',developer,async()=>{
 assert.equal((await one('select public.claim_staff_access() as access')).access,'developer');
 assert.equal((await db.query('select * from public.user_roles')).rows.length,0);
 assert.equal((await db.query('select * from public.retailer_applications')).rows.length,0);
 await assert.rejects(db.query('select public.owner_content()'),/Owner access required/);
 });
 await as('authenticated',owner,()=>db.query('update public.staff_invitations set enabled=false where id=$1',[invite]));
 assert.equal((await one('select enabled from public.staff_members where user_id=$1',[developer])).enabled,false);
});
test('draft content stays private until publishing and audit captures the owner',async()=>{
 await as('authenticated',owner,async()=>{
 await db.query("update public.site_content set draft=$1::jsonb where key='hero'",[JSON.stringify({title:'Private draft'})]);
 const content=await db.query('select * from public.owner_content()');assert.equal(content.rows.find(c=>c.key==='hero').draft.title,'Private draft');
 });
 await as('anon',null,async()=>assert.notEqual((await one("select published from public.published_site_content where key='hero'")).published.title,'Private draft'));
 await as('authenticated',owner,async()=>{const audit=await one("select actor_id from public.audit_log where entity='site_content' order by created_at desc limit 1");assert.equal(audit.actor_id,owner);});
});
test('quotations create invoices once and issued invoices remain immutable',async()=>{
 await as('authenticated',owner,async()=>{
 const c=await one("insert into public.customers(name,email) values('Customer','customer@example.test') returning id");
 const q=await one('select public.create_owner_quote($1::jsonb) as id',[JSON.stringify({customer_id:c.id,valid_until:'2027-01-01',discount_pence:0,delivery_pence:1000,vat_basis_points:2000,notes:'Test quote',items:[{description:'Oak flooring',quantity:10,unit:'sqm',unit_price_pence:3999}]})]);
 const i=await one('select public.invoice_from_quote($1) as id',[q.id]);
 assert.equal((await one('select public.invoice_from_quote($1) as id',[q.id])).id,i.id);
 await db.query("update public.invoices set status='issued' where id=$1",[i.id]);
 await assert.rejects(db.query("update public.invoices set notes='Changed' where id=$1",[i.id]),/immutable/);
 await assert.rejects(db.query("update public.invoice_items set quantity=99 where invoice_id=$1",[i.id]),/immutable/);
 });
});
test('storage writes are owner-only',async()=>{
 await as('authenticated',outsider,async()=>{await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('storefront-media','bad.webp')"),/row-level security/);});
 await as('authenticated',owner,()=>db.query("insert into storage.objects(bucket_id,name) values('storefront-media','owner.webp')"));
});
test('PIN attempts persist and are callable only by the private server role',async()=>{
 await as('authenticated',outsider,()=>assert.rejects(db.query('select public.owner_pin_attempt()'),/permission denied/));
 await as('service_role',null,async()=>{
 for(let i=0;i<5;i++)assert.equal((await one('select public.owner_pin_attempt() as ok')).ok,true);
 assert.equal((await one('select public.owner_pin_attempt() as ok')).ok,false);
 await db.query('select public.owner_pin_reset()');
 assert.equal((await one('select public.owner_pin_attempt() as ok')).ok,true);
 });
});
test.after(()=>db.close());
test('private PIN server sessions can manage products and are revoked on sign out',async()=>{
 await as('service_role',null,async()=>{
 const token='a'.repeat(64);
 assert.equal((await one("select public.owner_session('create',$1,now()+interval '2 hours') as ok",[token])).ok,true);
 assert.equal((await one("select public.owner_session('verify',$1) as ok",[token])).ok,true);
 assert.equal((await one('select private.is_admin() as ok')).ok,true);
 assert.equal((await db.query('select * from public.owner_content()')).rows.length,2);
 const p=await one("select id from public.products where slug='test-owner-floor'");
 assert.ok(p.id);
 await db.query("select public.owner_session('revoke',$1)",[token]);
 assert.equal((await one("select public.owner_session('verify',$1) as ok",[token])).ok,false);
 });
});
test('public product reads exclude supplier and warehouse details, and company payment details stay private',async()=>{
 await as('anon',null,async()=>{
 await assert.rejects(db.query('select supplier,warehouse_location,stock_packs from public.products'),/permission denied/);
 await assert.rejects(db.query('select payment_instructions from public.company_settings'),/permission denied/);
 assert.equal((await db.query('select * from public.public_business_details')).rows.length,0);
 });
 await as('authenticated',outsider,async()=>assert.equal((await db.query('select supplier from public.products')).rows.length,0));
});
