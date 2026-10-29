-- Keep name as the immutable three-digit QR code; display_name is admin-only.
ALTER TABLE restaurant_tables
  ADD COLUMN display_name text,
  ADD COLUMN is_active boolean NOT NULL DEFAULT true,
  ADD CONSTRAINT restaurant_tables_display_name_check
    CHECK (display_name IS NULL OR (char_length(display_name) BETWEEN 1 AND 100 AND display_name = btrim(display_name)));

-- Allocate monotonically so retired table codes are never reassigned.
CREATE SEQUENCE restaurant_table_code_seq AS integer MINVALUE 1 MAXVALUE 999 START 1 NO CYCLE;
SELECT setval(
  'restaurant_table_code_seq',
  greatest(coalesce(max(CASE WHEN name ~ '^[0-9]{3}$' THEN name::integer ELSE 0 END), 0), 1),
  coalesce(max(CASE WHEN name ~ '^[0-9]{3}$' THEN name::integer ELSE 0 END), 0) > 0
) FROM restaurant_tables;

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
  -- Serialize order placement with table retirement on the same table row.
  perform 1 from restaurant_tables where id = p_table_id and is_active = true for update;
  if not found then
    raise exception 'Table is unavailable';
  end if;

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
