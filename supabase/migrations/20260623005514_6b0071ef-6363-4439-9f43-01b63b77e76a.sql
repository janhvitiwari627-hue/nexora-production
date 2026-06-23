
-- Territory: add district-level coverage to distributors
ALTER TABLE public.distributors
  ADD COLUMN IF NOT EXISTS coverage_districts text[] NOT NULL DEFAULT '{}';

-- Brand <-> Distributor connections
CREATE TABLE IF NOT EXISTS public.brand_distributor_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  distributor_id uuid NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  initiated_by text NOT NULL CHECK (initiated_by IN ('brand','distributor')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
  message text,
  territory_notes text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, distributor_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_distributor_connections TO authenticated;
GRANT ALL ON public.brand_distributor_connections TO service_role;

ALTER TABLE public.brand_distributor_connections ENABLE ROW LEVEL SECURITY;

-- Read: either party (brand owner or distributor owner) can see
CREATE POLICY "Parties can view their connections"
  ON public.brand_distributor_connections FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = distributor_id AND d.user_id = auth.uid())
  );

-- Insert: initiator must own the side they claim to initiate from
CREATE POLICY "Initiator can create connection"
  ON public.brand_distributor_connections FOR INSERT
  TO authenticated
  WITH CHECK (
    (initiated_by = 'brand'
      AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid()))
    OR
    (initiated_by = 'distributor'
      AND EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = distributor_id AND d.user_id = auth.uid()))
  );

-- Update: either party can update status (accept/reject/cancel)
CREATE POLICY "Parties can update their connections"
  ON public.brand_distributor_connections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = distributor_id AND d.user_id = auth.uid())
  );

-- Delete: either party
CREATE POLICY "Parties can delete their connections"
  ON public.brand_distributor_connections FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.brands b WHERE b.id = brand_id AND b.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.distributors d WHERE d.id = distributor_id AND d.user_id = auth.uid())
  );

CREATE TRIGGER update_bdc_updated_at
  BEFORE UPDATE ON public.brand_distributor_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_bdc_brand ON public.brand_distributor_connections(brand_id);
CREATE INDEX IF NOT EXISTS idx_bdc_distributor ON public.brand_distributor_connections(distributor_id);
