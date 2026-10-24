-- Additive foundation. Existing storefront catalogue is imported separately as unverified drafts.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('customer','retailer','admin')),
  created_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;
-- Narrow helper avoids recursive RLS; never uses editable user_metadata.
create function private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select auth.uid() is not null and exists (
  select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
) $$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;
grant select on public.user_roles to authenticated;
create policy own_role on public.user_roles for select to authenticated using (user_id = (select auth.uid()));
-- Role assignment is deliberately restricted to trusted service / database administration.

create table public.categories (
 id uuid primary key default gen_random_uuid(), slug text not null unique,
 name text not null, description text not null default '', image_url text,
 published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.collections (
 id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
 brand text, published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(), slug text not null unique,
 name text not null, category_id uuid references public.categories(id),
 collection_id uuid references public.collections(id), brand text, sku text unique,
 description text not null default '', colour text, material text, finish text,
 thickness text, dimensions text, wear_layer text, installation text,
 warranty text, warranty_verified boolean not null default false,
 pack_coverage numeric(10,4) check(pack_coverage > 0),
 availability text not null default 'unconfirmed' check(availability in ('unconfirmed','in_stock','out_of_stock','made_to_order')),
 status text not null default 'draft' check(status in ('draft','published','archived')),
 source_url text, verified_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_variants (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 name text not null, sku text unique, colour text, specifications jsonb not null default '{}',
 published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_specifications (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 label text not null, value text not null, verified boolean not null default false,
 unique(product_id,label),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_images (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 url text not null, alt text not null, position integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_documents (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 title text not null, storage_path text not null, published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_prices (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
 variant_id uuid references public.product_variants(id),
 amount_pence bigint not null check(amount_pence >= 0),
 currency text not null default 'GBP' check(currency='GBP'),
 unit text not null check(unit in ('sqm','pack','item')),
 vat_included boolean not null, vat_basis_points integer not null check(vat_basis_points between 0 and 10000),
 verified boolean not null default false, approved_by uuid references auth.users(id),
 source_reference text, active boolean not null default true,
 check(not verified or (approved_by is not null and source_reference is not null)),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index one_active_base_price on public.product_prices(product_id,unit) where active and variant_id is null;
create unique index one_active_variant_price on public.product_prices(variant_id,unit) where active and variant_id is not null;

create table public.customers (
 id uuid primary key default gen_random_uuid(), user_id uuid unique references auth.users(id),
 name text not null, email text not null, phone text, postcode text, address jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.retailer_applications (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id),
 business_name text not null, contact_name text not null, email text not null, phone text not null,
 business_type text not null, address text not null, city text not null, postcode text not null, vat_number text,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 idempotency_key uuid not null unique,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.retailer_profiles (
 user_id uuid primary key references auth.users(id), application_id uuid not null unique references public.retailer_applications(id),
 business_name text not null, status text not null default 'approved' check(status in ('approved','suspended')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.enquiries (
 id uuid primary key default gen_random_uuid(), reference text not null unique default ('ENQ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))),
 customer_id uuid references public.customers(id), user_id uuid references auth.users(id),
 kind text not null check(kind in ('bulk','individual')),
 status text not null default 'new' check(status in ('new','contacted','quoted','closed')),
 contact_name text not null, business_name text, email text not null, phone text not null, postcode text not null,
 message text not null default '', whatsapp_opened_at timestamptz,
 idempotency_key uuid not null unique,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.enquiry_items (
 id uuid primary key default gen_random_uuid(), enquiry_id uuid not null references public.enquiries(id),
 product_id uuid not null references public.products(id), variant_id uuid references public.product_variants(id),
 quantity numeric(12,4) not null check(quantity > 0), area_sqm numeric(12,4) check(area_sqm > 0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.sample_requests (
 id uuid primary key default gen_random_uuid(), reference text not null unique default ('SMP-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))),
 user_id uuid references auth.users(id), contact_name text not null, email text not null,
 phone text, address text not null, city text not null, postcode text not null,
 status text not null default 'new' check(status in ('new','processing','dispatched','completed','cancelled')),
 tracking_reference text, dispatched_at timestamptz,
 idempotency_key uuid not null unique,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.sample_request_items (
 request_id uuid not null references public.sample_requests(id), product_id uuid not null references public.products(id),
 primary key(request_id,product_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create sequence private.document_number;
create table public.quotations (
 id uuid primary key default gen_random_uuid(), number text not null unique default ('QUO-'||lpad(nextval('private.document_number')::text,8,'0')),
 enquiry_id uuid references public.enquiries(id), customer_id uuid not null references public.customers(id),
 user_id uuid references auth.users(id), status text not null default 'draft' check(status in ('draft','sent','accepted','rejected','expired')),
 valid_until date not null, currency text not null default 'GBP' check(currency='GBP'),
 discount_pence bigint not null default 0 check(discount_pence >= 0),
 delivery_pence bigint not null default 0 check(delivery_pence >= 0),
 vat_basis_points integer not null default 0 check(vat_basis_points between 0 and 10000),
 notes text not null default '', pdf_path text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.quotation_items (
 id uuid primary key default gen_random_uuid(), quotation_id uuid not null references public.quotations(id),
 product_id uuid references public.products(id), description text not null,
 quantity numeric(12,4) not null check(quantity>0), unit text not null check(unit in ('sqm','pack','item')),
 unit_price_pence bigint not null check(unit_price_pence >= 0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.invoices (
 id uuid primary key default gen_random_uuid(), number text not null unique default ('INV-'||lpad(nextval('private.document_number')::text,8,'0')),
 quotation_id uuid references public.quotations(id), customer_id uuid not null references public.customers(id),
 user_id uuid references auth.users(id), status text not null default 'draft' check(status in ('draft','issued','paid','void')),
 invoice_date date not null, due_date date not null, check(due_date >= invoice_date),
 currency text not null default 'GBP' check(currency='GBP'),
 discount_pence bigint not null default 0 check(discount_pence>=0),
 delivery_pence bigint not null default 0 check(delivery_pence>=0),
 vat_basis_points integer not null default 0 check(vat_basis_points between 0 and 10000),
 company_snapshot jsonb not null default '{}', customer_snapshot jsonb not null default '{}',
 notes text not null default '', payment_instructions text not null default '', pdf_path text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.invoice_items (
 id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id),
 product_id uuid references public.products(id), description text not null,
 quantity numeric(12,4) not null check(quantity>0), unit text not null check(unit in ('sqm','pack','item')),
 unit_price_pence bigint not null check(unit_price_pence>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.support_tickets (
 id uuid primary key default gen_random_uuid(), number text not null unique default ('TKT-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))),
 user_id uuid references auth.users(id), customer_id uuid references public.customers(id),
 product_id uuid references public.products(id), email text not null, subject text not null,
 status text not null default 'open' check(status in ('open','in_progress','resolved','closed')),
 guest_token_hash text, guest_verified_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ticket_messages (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.support_tickets(id),
 author_id uuid references auth.users(id), body text not null check(length(body) between 1 and 10000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.notification_records (
 id uuid primary key default gen_random_uuid(), event_key text not null unique, event_type text not null,
 recipient text not null, payload jsonb not null default '{}',
 status text not null default 'pending' check(status in ('pending','processing','sent','failed')),
 attempts integer not null default 0 check(attempts>=0), provider_id text, last_error text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.company_settings (
 id boolean primary key default true check(id),
 company_name text not null default 'UNIQ FLOORS', business_email text,
 whatsapp_number text, address text, vat_number text, payment_instructions text,
 email_from text, public_contact_approved boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create function private.touch_updated_at() returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at=now(); return new; end $$;
revoke all on function private.touch_updated_at() from public;

-- Default-deny private records. Admin mutations require server-verified identity and RLS.
do $$
declare t text;
begin
 foreach t in array array['categories','collections','products','product_variants','product_specifications','product_images','product_documents','product_prices','customers','retailer_applications','retailer_profiles','enquiries','enquiry_items','sample_requests','sample_request_items','quotations','quotation_items','invoices','invoice_items','support_tickets','ticket_messages','notification_records','company_settings']
 loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select, insert, update, delete on public.%I to authenticated',t);
  execute format('create policy admin_access on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',t);
  execute format('create trigger updated_at before update on public.%I for each row execute function private.touch_updated_at()',t);
 end loop;
end $$;
grant usage on sequence private.document_number to authenticated,service_role;

grant select on public.categories,public.collections,public.products,public.product_variants,public.product_specifications,public.product_images,public.product_documents,public.product_prices to anon;
create policy published_categories on public.categories for select to anon,authenticated using(published);
create policy published_collections on public.collections for select to anon,authenticated using(published);
create policy published_products on public.products for select to anon,authenticated using(status='published');
do $$
declare t text;
begin
 foreach t in array array['product_variants','product_specifications','product_images','product_documents','product_prices']
 loop
  execute format('create policy published_product_records on public.%I for select to anon,authenticated using (exists (select 1 from public.products p where p.id=product_id and p.status=''published'') %s)',t,
   case when t='product_prices' then 'and verified and active'
        when t='product_specifications' then 'and verified'
        when t in ('product_variants','product_documents') then 'and published' else '' end);
 end loop;
end $$;
do $$
declare t text;
begin
 foreach t in array array['customers','retailer_applications','retailer_profiles','enquiries','sample_requests','quotations','invoices','support_tickets']
 loop
  execute format('create policy own_records on public.%I for select to authenticated using(user_id=(select auth.uid()))',t);
  execute format('create index %I on public.%I(user_id)',t||'_owner_idx',t);
 end loop;
end $$;
create policy own_enquiry_items on public.enquiry_items for select to authenticated using(exists(select 1 from public.enquiries e where e.id=enquiry_id and e.user_id=(select auth.uid())));
create policy own_sample_items on public.sample_request_items for select to authenticated using(exists(select 1 from public.sample_requests s where s.id=request_id and s.user_id=(select auth.uid())));
create policy own_quotation_items on public.quotation_items for select to authenticated using(exists(select 1 from public.quotations q where q.id=quotation_id and q.user_id=(select auth.uid())));
create policy own_invoice_items on public.invoice_items for select to authenticated using(exists(select 1 from public.invoices i where i.id=invoice_id and i.user_id=(select auth.uid())));
create policy own_ticket_messages on public.ticket_messages for select to authenticated using(exists(select 1 from public.support_tickets t where t.id=ticket_id and t.user_id=(select auth.uid())));

create index products_category_idx on public.products(category_id);
create index products_collection_idx on public.products(collection_id);
create index enquiries_status_idx on public.enquiries(status,created_at desc);
create index samples_status_idx on public.sample_requests(status,created_at desc);
create index tickets_status_idx on public.support_tickets(status,created_at desc);
create index notifications_pending_idx on public.notification_records(status,created_at);
create index enquiry_items_parent_idx on public.enquiry_items(enquiry_id);
create index ticket_messages_parent_idx on public.ticket_messages(ticket_id,created_at);
create index quotation_items_parent_idx on public.quotation_items(quotation_id);
create index invoice_items_parent_idx on public.invoice_items(invoice_id);

-- Issued invoices and their line items must remain immutable, including to admins.
create function private.protect_invoice() returns trigger language plpgsql set search_path = ''
as $$ begin
 if old.status <> 'draft' then raise exception 'Issued invoices are immutable; create a replacement document'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger immutable_invoice before update or delete on public.invoices for each row execute function private.protect_invoice();
create function private.protect_invoice_items() returns trigger language plpgsql set search_path = ''
as $$ declare parent_status text; begin
 if tg_op<>'INSERT' and exists(select 1 from public.invoices where id=old.invoice_id and status<>'draft') then
  raise exception 'Issued invoice items are immutable'; end if;
 if tg_op<>'DELETE' and exists(select 1 from public.invoices where id=new.invoice_id and status<>'draft') then
  raise exception 'Issued invoice items are immutable'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger immutable_invoice_items before insert or update or delete on public.invoice_items for each row execute function private.protect_invoice_items();
revoke all on function private.protect_invoice(),private.protect_invoice_items() from public;

insert into public.company_settings(company_name) values('UNIQ FLOORS');
