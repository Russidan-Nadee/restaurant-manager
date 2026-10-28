-- restaurant-manager first draft schema
-- Apply with npm run db:migrate using DATABASE_URL_UNPOOLED.

-- gen_random_uuid() is built into supported PostgreSQL versions.

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
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be an array';
  end if;

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
