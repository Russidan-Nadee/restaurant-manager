CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200 AND name = btrim(name)),
  phone text CHECK (phone IS NULL OR (char_length(phone) BETWEEN 1 AND 50 AND phone = btrim(phone))),
  job_title text CHECK (job_title IS NULL OR (char_length(job_title) BETWEEN 1 AND 100 AND job_title = btrim(job_title))),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
