-- table-order first draft schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists pgcrypto;

create table restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references restaurant_tables(id),
  status text not null default 'placed',
  total_amount numeric(10,2) not null,
  note text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name_snapshot text not null,
  price_snapshot numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index on menu_items (category_id);
create index on order_items (order_id);
create index on orders (created_at desc);

-- Atomic order placement: re-validates price/availability server-side so a
-- stale cart or tampered price can never produce a bad order.
create or replace function place_order(p_table_id uuid, p_items jsonb)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_total numeric(10,2) := 0;
  v_item record;
  v_menu record;
  v_subtotal numeric(10,2);
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  insert into orders (table_id, total_amount) values (p_table_id, 0)
    returning id into v_order_id;

  for v_item in select * from jsonb_to_recordset(p_items) as x(menu_item_id uuid, quantity int)
  loop
    select id, name, price, is_active into v_menu from menu_items where id = v_item.menu_item_id;
    if not found or v_menu.is_active = false then
      raise exception 'Item % is no longer available', v_item.menu_item_id;
    end if;

    v_subtotal := v_menu.price * v_item.quantity;
    v_total := v_total + v_subtotal;

    insert into order_items (order_id, menu_item_id, name_snapshot, price_snapshot, quantity, subtotal)
    values (v_order_id, v_menu.id, v_menu.name, v_menu.price, v_item.quantity, v_subtotal);
  end loop;

  update orders set total_amount = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- RLS: stays on everywhere. Admin writes use the service-role client
-- (bypasses RLS) so no anon insert/update/delete policies exist for
-- restaurant_tables / categories / menu_items.
alter table restaurant_tables enable row level security;
alter table categories        enable row level security;
alter table menu_items        enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;

create policy "anon can read tables"      on restaurant_tables for select to anon using (true);
create policy "anon can read categories"  on categories        for select to anon using (true);
create policy "anon can read menu_items"  on menu_items        for select to anon using (true);
create policy "anon can read orders"      on orders             for select to anon using (true);
create policy "anon can read order_items" on order_items        for select to anon using (true);

create policy "anon can insert orders"      on orders      for insert to anon with check (true);
create policy "anon can insert order_items" on order_items for insert to anon with check (true);

-- Manual one-time setup after running this file (Supabase dashboard):
-- Database > Replication: enable the "orders" table for Realtime,
-- or run:  alter publication supabase_realtime add table orders;
