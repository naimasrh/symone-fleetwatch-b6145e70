-- Create policies to allow public read access to the tables used by current_fleet_status view
-- This is needed for a fleet monitoring dashboard without authentication

-- Drop existing policies if they exist, then create new ones

-- Allow public read access to vehicles table
DROP POLICY IF EXISTS "Allow public read access to vehicles" ON vehicles;
CREATE POLICY "Allow public read access to vehicles"
ON vehicles
FOR SELECT
TO public
USING (true);

-- Allow public read access to drivers table
DROP POLICY IF EXISTS "Allow public read access to drivers" ON drivers;
CREATE POLICY "Allow public read access to drivers"
ON drivers
FOR SELECT
TO public
USING (true);

-- Allow public read access to missions table
DROP POLICY IF EXISTS "Allow public read access to missions" ON missions;
CREATE POLICY "Allow public read access to missions"
ON missions
FOR SELECT
TO public
USING (true);

-- Allow public read access to gps_positions table
DROP POLICY IF EXISTS "Allow public read access to gps_positions" ON gps_positions;
CREATE POLICY "Allow public read access to gps_positions"
ON gps_positions
FOR SELECT
TO public
USING (true);
