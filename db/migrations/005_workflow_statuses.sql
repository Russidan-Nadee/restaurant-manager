-- Ordered service states and explicit table visits; no business fixtures.
CREATE TABLE public.restaurant_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('table', 'food')),
  code text,
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 60 AND label = btrim(label)),
  sort_order integer NOT NULL CHECK (sort_order >= 0),
  is_required boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  UNIQUE (scope, id), UNIQUE (scope, code)
);
CREATE UNIQUE INDEX restaurant_statuses_active_label_key
  ON public.restaurant_statuses (scope, lower(label)) WHERE deleted_at IS NULL;

INSERT INTO public.restaurant_statuses (id, scope, code, label, sort_order, is_required) VALUES
  ('10000000-0000-4000-8000-000000000001', 'table', 'free', 'ว่าง', 0, true),
  ('10000000-0000-4000-8000-000000000002', 'table', 'occupied', 'มีลูกค้า', 100, true),
  ('10000000-0000-4000-8000-000000000003', 'food', 'waiting', 'รอทำ', 100, true),
  ('10000000-0000-4000-8000-000000000004', 'food', 'ready', 'พร้อมเสิร์ฟ', 200, true),
  ('10000000-0000-4000-8000-000000000005', 'food', 'served', 'เสิร์ฟแล้ว', 300, false);

CREATE FUNCTION public.protect_required_restaurant_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_required THEN RAISE EXCEPTION 'Required status cannot be deleted'; END IF;
    RETURN OLD;
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.scope IS DISTINCT FROM OLD.scope
    OR NEW.code IS DISTINCT FROM OLD.code OR NEW.is_required IS DISTINCT FROM OLD.is_required THEN
    RAISE EXCEPTION 'Status identity cannot be changed';
  END IF;
  IF OLD.is_required AND (NEW.deleted_at IS NOT NULL OR NEW.label IS DISTINCT FROM OLD.label) THEN
    RAISE EXCEPTION 'Required status cannot be removed or renamed';
  END IF;
  IF (OLD.scope = 'table' AND OLD.code IN ('free', 'occupied')) OR (OLD.scope = 'food' AND OLD.code = 'waiting') THEN
    IF NEW.sort_order IS DISTINCT FROM OLD.sort_order THEN RAISE EXCEPTION 'Initial states cannot move'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER restaurant_statuses_required_guard BEFORE UPDATE OR DELETE
  ON public.restaurant_statuses FOR EACH ROW EXECUTE FUNCTION public.protect_required_restaurant_status();

ALTER TABLE public.restaurant_tables
  ADD COLUMN state_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN status_id uuid NOT NULL DEFAULT '10000000-0000-4000-8000-000000000001',
  ADD COLUMN status_scope text NOT NULL DEFAULT 'table' CHECK (status_scope = 'table'),
  ADD FOREIGN KEY (status_scope, status_id) REFERENCES public.restaurant_statuses (scope, id);
CREATE TABLE public.table_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.restaurant_tables(id),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz CHECK (closed_at IS NULL OR closed_at >= opened_at)
);
CREATE UNIQUE INDEX table_sessions_one_open_per_table ON public.table_sessions(table_id) WHERE closed_at IS NULL;
ALTER TABLE public.orders ADD COLUMN session_id uuid REFERENCES public.table_sessions(id);
CREATE INDEX orders_session_id_idx ON public.orders(session_id) WHERE session_id IS NOT NULL;
ALTER TABLE public.order_items
  ADD COLUMN status_id uuid NOT NULL DEFAULT '10000000-0000-4000-8000-000000000003',
  ADD COLUMN status_scope text NOT NULL DEFAULT 'food' CHECK (status_scope = 'food'),
  ADD FOREIGN KEY (status_scope, status_id) REFERENCES public.restaurant_statuses(scope, id);

-- Keep previous orders and map their food states without fabricating visits.
UPDATE public.order_items i SET status_id = CASE
  WHEN o.status IN ('placed', 'preparing') THEN '10000000-0000-4000-8000-000000000003'::uuid
  WHEN o.status = 'ready' THEN '10000000-0000-4000-8000-000000000004'::uuid
  ELSE '10000000-0000-4000-8000-000000000005'::uuid END
FROM public.orders o WHERE i.order_id = o.id;
INSERT INTO public.table_sessions (table_id, opened_at)
SELECT o.table_id, min(o.created_at) FROM public.orders o
WHERE o.status IN ('placed', 'preparing', 'ready') GROUP BY o.table_id;
UPDATE public.orders o SET session_id = s.id FROM public.table_sessions s
WHERE o.table_id = s.table_id AND s.closed_at IS NULL AND o.status IN ('placed', 'preparing', 'ready');
UPDATE public.orders SET status = 'placed' WHERE status = 'preparing';
UPDATE public.restaurant_tables t SET status_id = '10000000-0000-4000-8000-000000000002'
WHERE EXISTS (SELECT 1 FROM public.table_sessions s WHERE s.table_id = t.id AND s.closed_at IS NULL);

-- Retain migration004's authoritative menu/option/snapshot implementation.
ALTER FUNCTION public.place_order(uuid, jsonb) RENAME TO place_order_menu_options_v4;
CREATE FUNCTION public.place_order(p_table_id uuid, p_items jsonb)
RETURNS uuid LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_table record;
  v_session_id uuid;
  v_order_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(16300509);
  SELECT t.id, st.code INTO v_table FROM public.restaurant_tables t
    JOIN public.restaurant_statuses st ON st.id = t.status_id
    WHERE t.id = p_table_id AND t.is_active = true AND st.deleted_at IS NULL
    FOR UPDATE OF t;
  IF NOT FOUND OR v_table.code IS NULL OR v_table.code NOT IN ('free', 'occupied') THEN
    RAISE EXCEPTION 'Table is unavailable for ordering';
  END IF;
  SELECT id INTO v_session_id FROM public.table_sessions WHERE table_id = p_table_id AND closed_at IS NULL;
  IF v_session_id IS NULL THEN
    INSERT INTO public.table_sessions (table_id) VALUES (p_table_id) RETURNING id INTO v_session_id;
  END IF;
  UPDATE public.restaurant_tables SET status_id = '10000000-0000-4000-8000-000000000002', state_token = gen_random_uuid() WHERE id = p_table_id AND status_id <> '10000000-0000-4000-8000-000000000002';
  v_order_id := public.place_order_menu_options_v4(p_table_id, p_items);
  UPDATE public.orders SET session_id = v_session_id WHERE id = v_order_id;
  RETURN v_order_id;
END;
$$;
