-- Create enum for vehicle types
CREATE TYPE vehicle_type AS ENUM ('truck', 'van', 'car');

-- Create enum for vehicle status
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'inactive');

-- Create enum for mission status
CREATE TYPE mission_status AS ENUM ('planned', 'in-progress', 'completed', 'cancelled');

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number TEXT NOT NULL UNIQUE,
  type vehicle_type NOT NULL DEFAULT 'van',
  status vehicle_status NOT NULL DEFAULT 'active',
  current_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create missions table
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  origin_lat FLOAT NOT NULL,
  origin_lng FLOAT NOT NULL,
  destination TEXT NOT NULL,
  destination_lat FLOAT NOT NULL,
  destination_lng FLOAT NOT NULL,
  status mission_status NOT NULL DEFAULT 'planned',
  scheduled_start TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_end TIMESTAMPTZ,
  delay_minutes INTEGER DEFAULT 0,
  distance_km FLOAT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create gps_positions table for real-time tracking
CREATE TABLE public.gps_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  speed FLOAT DEFAULT 0,
  heading INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create statistics table for daily aggregations
CREATE TABLE public.statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_km FLOAT DEFAULT 0,
  co2_saved FLOAT DEFAULT 0,
  total_delays_minutes INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  missions_total INTEGER DEFAULT 0,
  incidents_resolved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create view for current fleet status
CREATE OR REPLACE VIEW current_fleet_status AS
SELECT 
  v.id as vehicle_id,
  v.plate_number,
  v.type,
  d.name as driver_name,
  m.id as mission_id,
  m.origin,
  m.origin_lat,
  m.origin_lng,
  m.destination,
  m.destination_lat,
  m.destination_lng,
  m.status as mission_status,
  m.delay_minutes,
  gps.latitude,
  gps.longitude,
  gps.speed,
  gps.timestamp as last_update
FROM vehicles v
LEFT JOIN missions m ON m.vehicle_id = v.id AND m.status IN ('planned', 'in-progress')
LEFT JOIN drivers d ON d.id = m.driver_id
LEFT JOIN LATERAL (
  SELECT latitude, longitude, speed, timestamp
  FROM gps_positions
  WHERE vehicle_id = v.id
  ORDER BY timestamp DESC
  LIMIT 1
) gps ON true
WHERE v.status = 'active';

-- Enable Row Level Security
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read on drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Allow public read on vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Allow public read on missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Allow public read on gps_positions" ON public.gps_positions FOR SELECT USING (true);
CREATE POLICY "Allow public read on statistics" ON public.statistics FOR SELECT USING (true);

-- Enable realtime for missions and gps_positions
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gps_positions;