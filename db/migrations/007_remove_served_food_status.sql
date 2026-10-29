-- Remove the optional served step from the active flow without losing history.
SELECT pg_advisory_xact_lock(16300509);

DO $$
DECLARE
  ready_id uuid;
BEGIN
  SELECT id INTO ready_id FROM public.restaurant_statuses
    WHERE scope = 'food' AND code = 'ready' AND deleted_at IS NULL;
  IF ready_id IS NULL THEN RAISE EXCEPTION 'Active ready status is required'; END IF;

  UPDATE public.order_items AS i SET status_id = ready_id
    FROM public.orders AS o, public.table_sessions AS ts, public.restaurant_statuses AS s
    WHERE i.order_id = o.id AND o.session_id = ts.id AND ts.closed_at IS NULL
      AND i.status_id = s.id AND s.scope = 'food' AND s.code = 'served';

  UPDATE public.restaurant_statuses SET deleted_at = now()
    WHERE scope = 'food' AND code = 'served' AND deleted_at IS NULL;
END;
$$;

-- Reconcile the legacy order summary with the remaining active food steps.
WITH final_food AS (
  SELECT id, code FROM public.restaurant_statuses
  WHERE scope = 'food' AND deleted_at IS NULL ORDER BY sort_order DESC, id DESC LIMIT 1
), readiness AS (
  SELECT o.id,
    bool_and(i.status_id = f.id) AS complete,
    bool_and(s.sort_order >= r.sort_order) AS all_ready,
    f.code AS final_code
  FROM public.orders o JOIN public.table_sessions ts ON ts.id = o.session_id AND ts.closed_at IS NULL
  JOIN public.order_items i ON i.order_id = o.id
  JOIN public.restaurant_statuses s ON s.id = i.status_id
  CROSS JOIN final_food f
  JOIN public.restaurant_statuses r ON r.scope = 'food' AND r.code = 'ready' AND r.deleted_at IS NULL
  WHERE o.status NOT IN ('paid', 'closed')
  GROUP BY o.id, f.code
)
UPDATE public.orders o SET status = CASE
  WHEN r.complete AND r.final_code IS DISTINCT FROM 'ready' THEN 'served'
  WHEN r.all_ready THEN 'ready' ELSE 'placed' END
FROM readiness r WHERE o.id = r.id;
