CREATE TABLE public.vehicle_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_slug TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.vehicle_enquiries TO anon, authenticated;
GRANT ALL ON public.vehicle_enquiries TO service_role;
ALTER TABLE public.vehicle_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an enquiry" ON public.vehicle_enquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(vehicle_slug) BETWEEN 1 AND 80
    AND (message IS NULL OR char_length(message) <= 2000)
    AND (phone IS NULL OR char_length(phone) <= 40)
  );