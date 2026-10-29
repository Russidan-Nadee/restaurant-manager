-- Manual receipt acknowledgements for closed table sessions.
CREATE TABLE public.table_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.table_sessions(id),
  amount numeric NOT NULL CHECK (amount >= 0 AND scale(amount) <= 2),
  currency text NOT NULL DEFAULT 'THB' CHECK (currency = 'THB'),
  paid_at timestamptz NOT NULL DEFAULT now()
);
