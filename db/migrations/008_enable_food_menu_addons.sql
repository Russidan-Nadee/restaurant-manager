-- Enable existing protein choices and the existing THB 10 special serving.
-- This one-time configuration keeps menu prices and order snapshots unchanged.
SELECT pg_advisory_xact_lock(16300509);

UPDATE public.menu_items
SET protein_options = ARRAY['chicken', 'pork', 'beef', 'shrimp', 'squid']::text[],
    special_available = true, updated_at = now()
WHERE btrim(name) NOT IN ('น้ำแข็ง', 'น้ำเปล่า');

UPDATE public.menu_items
SET protein_options = '{}'::text[], special_available = false, updated_at = now()
WHERE btrim(name) IN ('น้ำแข็ง', 'น้ำเปล่า');
