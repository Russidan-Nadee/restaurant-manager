-- Each menu opts into its own proteins and special serving; existing menus keep
-- their current behavior until configured. No menu or order data is seeded.
ALTER TABLE public.menu_items
  ADD COLUMN protein_options text[] NOT NULL DEFAULT '{}',
  ADD COLUMN special_available boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT menu_items_protein_options_check CHECK (
    protein_options <@ ARRAY['chicken', 'pork', 'beef', 'shrimp', 'squid']::text[]
    AND array_position(protein_options, NULL) IS NULL
    AND (cardinality(protein_options) = 0 OR array_ndims(protein_options) = 1)
  );

ALTER TABLE public.order_items
  ADD COLUMN protein_snapshot text,
  ADD COLUMN is_special boolean NOT NULL DEFAULT false,
  ADD COLUMN special_price_snapshot numeric(10,2) NOT NULL DEFAULT 0,
  ADD CONSTRAINT order_items_special_price_check CHECK (
    (is_special AND special_price_snapshot = 10)
    OR (NOT is_special AND special_price_snapshot = 0)
  );

CREATE OR REPLACE FUNCTION public.place_order(p_table_id uuid, p_items jsonb)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_menu record;
  v_quantity_number numeric;
  v_quantity integer;
  v_protein text;
  v_protein_label text;
  v_is_special boolean;
  v_special_price numeric(10,2);
  v_price numeric(10,2);
  v_subtotal numeric(10,2);
BEGIN
  -- Migration 003 is required. Retain its table-retirement serialization.
  PERFORM 1 FROM public.restaurant_tables
  WHERE id = p_table_id AND is_active = true
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Table is unavailable';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Items must be an array';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Validate raw JSON before casting: recordset coercion can otherwise round
  -- quantities or accept strings, and malformed entries must never disappear.
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF jsonb_typeof(v_item) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION 'Invalid menu item';
    END IF;
    IF jsonb_typeof(v_item -> 'menu_item_id') IS DISTINCT FROM 'string'
      OR (v_item ->> 'menu_item_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      RAISE EXCEPTION 'A valid menu item ID is required';
    END IF;
    IF jsonb_typeof(v_item -> 'quantity') IS DISTINCT FROM 'number' THEN
      RAISE EXCEPTION 'Quantity must be a positive whole number';
    END IF;
    v_quantity_number := (v_item ->> 'quantity')::numeric;
    IF v_quantity_number < 1 OR v_quantity_number > 2147483647
      OR trunc(v_quantity_number) <> v_quantity_number THEN
      RAISE EXCEPTION 'Quantity must be a positive whole number';
    END IF;
    IF v_item ? 'protein' AND jsonb_typeof(v_item -> 'protein') NOT IN ('string', 'null') THEN
      RAISE EXCEPTION 'Invalid protein';
    END IF;
    v_protein := v_item ->> 'protein';
    IF v_protein IS NOT NULL AND v_protein NOT IN ('chicken', 'pork', 'beef', 'shrimp', 'squid') THEN
      RAISE EXCEPTION 'Invalid protein';
    END IF;
    IF v_item ? 'is_special' AND jsonb_typeof(v_item -> 'is_special') IS DISTINCT FROM 'boolean' THEN
      RAISE EXCEPTION 'Special must be true or false';
    END IF;
  END LOOP;

  -- SHARE blocks price/options/availability updates until the order commits.
  -- Lock in UUID order so carts with different line ordering do not deadlock.
  PERFORM m.id
  FROM public.menu_items AS m
  WHERE m.id IN (
    SELECT (value ->> 'menu_item_id')::uuid
    FROM jsonb_array_elements(p_items)
  )
  ORDER BY m.id
  FOR SHARE;

  INSERT INTO public.orders (table_id, total_amount)
  VALUES (p_table_id, 0)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, name, price, is_active, protein_options, special_available
    INTO v_menu
    FROM public.menu_items
    WHERE id = (v_item ->> 'menu_item_id')::uuid
    FOR SHARE;
    IF NOT FOUND OR v_menu.is_active = false THEN
      RAISE EXCEPTION 'Item % is no longer available', v_item ->> 'menu_item_id';
    END IF;

    v_quantity := (v_item ->> 'quantity')::numeric::integer;
    v_protein := v_item ->> 'protein';
    v_is_special := coalesce((v_item ->> 'is_special')::boolean, false);
    IF cardinality(v_menu.protein_options) > 0 THEN
      IF v_protein IS NULL OR NOT (v_protein = ANY(v_menu.protein_options)) THEN
        RAISE EXCEPTION 'Choose an available protein for item %', v_menu.id;
      END IF;
    ELSIF v_protein IS NOT NULL THEN
      RAISE EXCEPTION 'Protein selection is unavailable for item %', v_menu.id;
    END IF;
    IF v_is_special AND NOT v_menu.special_available THEN
      RAISE EXCEPTION 'Special is unavailable for item %', v_menu.id;
    END IF;

    v_protein_label := CASE v_protein
      WHEN 'chicken' THEN 'ไก่'
      WHEN 'pork' THEN 'หมู'
      WHEN 'beef' THEN 'เนื้อ'
      WHEN 'shrimp' THEN 'กุ้ง'
      WHEN 'squid' THEN 'หมึก'
      ELSE NULL
    END;
    v_special_price := CASE WHEN v_is_special THEN 10 ELSE 0 END;
    v_price := v_menu.price + v_special_price;
    v_subtotal := v_price * v_quantity;
    v_total := v_total + v_subtotal;

    INSERT INTO public.order_items (
      order_id, menu_item_id, name_snapshot, price_snapshot, quantity, subtotal,
      protein_snapshot, is_special, special_price_snapshot
    ) VALUES (
      v_order_id, v_menu.id, v_menu.name, v_price, v_quantity, v_subtotal,
      v_protein_label, v_is_special, v_special_price
    );
  END LOOP;

  UPDATE public.orders SET total_amount = v_total WHERE id = v_order_id;
  RETURN v_order_id;
END;
$$;
