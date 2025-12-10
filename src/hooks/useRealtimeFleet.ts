import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-external";

export interface FleetVehicle {
  vehicle_id: string;
  license_plate: string;
  type: string;
  driver_name: string | null;
  mission_id: string | null;
  origin: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  destination: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
  mission_status: string | null;
  delay_minutes: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  last_update: string | null;
}

export const useRealtimeFleet = () => {
  const [fleetData, setFleetData] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 Fetching fleet data...');
      const { data, error } = await supabase
        .from('current_fleet_status')
        .select('*');
      
      if (error) {
        console.error('❌ FLEET ERROR - Détails complets:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
      } else {
        console.log('✅ Fleet data fetched successfully:', data?.length, 'vehicles');
        setFleetData(data || []);
      }
      setIsLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return { fleetData, isLoading };
};
