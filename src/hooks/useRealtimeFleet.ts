import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-external";

export interface FleetVehicle {
  vehicle_id: string;
  license_plate: string;
  type: string;
  driver_name: string | null;
  mission_id: string | null;
  origin_address: string | null;
  origin_lat: number | null;
  origin_lon: number | null;
  destination_address: string | null;
  destination_lat: number | null;
  destination_lon: number | null;
  mission_status: string | null;
  delay_minutes: number | null;
  latitude: number | null;
  longitude: number | null;
  speed_kmh: number | null;
  last_update: string | null;
}

export const useRealtimeFleet = () => {
  const [fleetData, setFleetData] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 Fetching fleet data...');
      
      // Fetch vehicles with their current missions and GPS positions
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, license_plate, type');
      
      if (vehiclesError) {
        console.error('❌ FLEET ERROR - vehicles:', vehiclesError);
        setIsLoading(false);
        return;
      }

      // Fetch drivers
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('id, name');
      
      if (driversError) {
        console.error('❌ FLEET ERROR - drivers:', driversError);
      }

      // Fetch active missions (in_progress or scheduled)
      const { data: missions, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .in('status', ['in_progress', 'scheduled']);
      
      if (missionsError) {
        console.error('❌ FLEET ERROR - missions:', missionsError);
      }

      // Fetch latest GPS positions for each vehicle
      const { data: gpsPositions, error: gpsError } = await supabase
        .from('gps_positions')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (gpsError) {
        console.error('❌ FLEET ERROR - gps_positions:', gpsError);
      }

      // Build driver map
      const driverMap = new Map<string, string>();
      (drivers || []).forEach(d => driverMap.set(d.id, d.name));

      // Build mission map by vehicle_id (most recent active mission)
      const missionMap = new Map<string, any>();
      (missions || []).forEach(m => {
        if (!missionMap.has(m.vehicle_id)) {
          missionMap.set(m.vehicle_id, m);
        }
      });

      // Build GPS map by vehicle_id (most recent position)
      const gpsMap = new Map<string, any>();
      (gpsPositions || []).forEach(gps => {
        if (!gpsMap.has(gps.vehicle_id)) {
          gpsMap.set(gps.vehicle_id, gps);
        }
      });

      // Combine data
      const fleetVehicles: FleetVehicle[] = (vehicles || []).map(vehicle => {
        const mission = missionMap.get(vehicle.id);
        const gps = gpsMap.get(vehicle.id);
        const driverName = mission?.driver_id ? driverMap.get(mission.driver_id) : null;

        return {
          vehicle_id: vehicle.id,
          license_plate: vehicle.license_plate,
          type: vehicle.type,
          driver_name: driverName || null,
          mission_id: mission?.id || null,
          origin_address: mission?.origin_address || null,
          origin_lat: mission?.origin_lat || null,
          origin_lon: mission?.origin_lon || null,
          destination_address: mission?.destination_address || null,
          destination_lat: mission?.destination_lat || null,
          destination_lon: mission?.destination_lon || null,
          mission_status: mission?.status || null,
          delay_minutes: mission?.delay_minutes || null,
          latitude: gps?.latitude || null,
          longitude: gps?.longitude || null,
          speed_kmh: gps?.speed_kmh || null,
          last_update: gps?.timestamp || null,
        };
      });

      console.log('✅ Fleet data fetched successfully:', fleetVehicles.length, 'vehicles');
      setFleetData(fleetVehicles);
      setIsLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return { fleetData, isLoading };
};
