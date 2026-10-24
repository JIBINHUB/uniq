-- Apply after the owner workspace migration. Trade requests are estimates, not orders.
create table public.trade_quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  idempotency_key uuid not null,
  business_name text not null,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
  subtotal_pence bigint not null check (subtotal_pence >= 0),
  vat_pence bigint not null check (vat_pence >= 0),
  estimated_total_pence bigint not null check (estimated_total_pence >= 0),
  status text not null default 'new' check (status in ('new', 'pending', 'approved', 'rejected')),
  review_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index trade_quote_requests_user_date on public.trade_quote_requests(user_id, created_at desc);
create index trade_quote_requests_status_date on public.trade_quote_requests(status, created_at desc);
alter table public.trade_quote_requests enable row level security;
revoke all on public.trade_quote_requests from public, anon, authenticated;
grant select, update on public.trade_quote_requests to authenticated;
grant select, insert, update on public.trade_quote_requests to service_role;
create policy own_trade_quote_history on public.trade_quote_requests
  for select to authenticated using (user_id = (select auth.uid()));
create policy owner_trade_quotes on public.trade_quote_requests
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create trigger trade_quote_updated_at before update on public.trade_quote_requests
  for each row execute function private.touch_updated_at();
create trigger trade_quote_audit after insert or update on public.trade_quote_requests
  for each row execute function private.audit_owner_change();
