-- Create mission_enriched view with all necessary data
CREATE OR REPLACE VIEW public.mission_enriched AS
SELECT 
  m.*,
  d.name as driver_name,
  v.plate_number
FROM public.missions m
LEFT JOIN public.drivers d ON m.driver_id = d.id
LEFT JOIN public.vehicles v ON m.vehicle_id = v.id;