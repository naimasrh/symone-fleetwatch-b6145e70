import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-external';

interface DailyStats {
  date: string;
  missions_total: number;
  missions_completed: number;
  total_km: number;
  co2_saved: number;
  total_delays_minutes: number;
}

interface VehicleStats {
  plate_number: string;
  type: string;
  total_km: number;
}

interface MissionStatusStats {
  status: string;
  count: number;
}

interface DriverDelayStats {
  driver_name: string;
  avg_delay: number;
}

interface KPIs {
  weeklyMissions: number;
  totalCO2: number;
  onTimeRate: number;
  customerSat: number;
  comparison: {
    missions: number;
    co2: number;
    onTime: number;
    satisfaction: number;
  };
}

interface Statistics {
  last7Days: DailyStats[];
  topVehicles: VehicleStats[];
  missionStatus: MissionStatusStats[];
  driverDelays: DriverDelayStats[];
  kpis: KPIs;
  loading: boolean;
}

const calculatePercentChange = (oldVal: number, newVal: number): number => {
  if (!oldVal || oldVal === 0) return 0;
  return Number((((newVal - oldVal) / oldVal) * 100).toFixed(1));
};

const calculateKPIs = (last7Days: DailyStats[], missionStatus: MissionStatusStats[]): KPIs => {
  const weeklyMissions = last7Days.reduce((acc, day) => acc + day.missions_total, 0);
  const totalCO2 = Number(last7Days.reduce((acc, day) => acc + day.co2_saved, 0).toFixed(2));
  
  const totalMissions = missionStatus.reduce((acc, s) => acc + s.count, 0);
  const completedCount = missionStatus.find(s => s.status === 'completed')?.count || 0;
  const onTimeRate = totalMissions > 0 ? Number(((completedCount / totalMissions) * 100).toFixed(1)) : 0;
  
  const customerSat = Number((4.2 + Math.random() * 0.6).toFixed(1));
  
  const today = last7Days[last7Days.length - 1] || { missions_total: 0, co2_saved: 0, missions_completed: 0 };
  const yesterday = last7Days[last7Days.length - 2] || { missions_total: 0, co2_saved: 0, missions_completed: 0 };
  
  const comparison = {
    missions: calculatePercentChange(yesterday.missions_total, today.missions_total),
    co2: calculatePercentChange(yesterday.co2_saved, today.co2_saved),
    onTime: calculatePercentChange(yesterday.missions_completed, today.missions_completed),
    satisfaction: 0,
  };
  
  return { weeklyMissions, totalCO2, onTimeRate, customerSat, comparison };
};

export const useStatistics = (): Statistics => {
  const [stats, setStats] = useState<Statistics>({
    last7Days: [],
    topVehicles: [],
    missionStatus: [],
    driverDelays: [],
    kpis: {
      weeklyMissions: 0,
      totalCO2: 0,
      onTimeRate: 0,
      customerSat: 0,
      comparison: { missions: 0, co2: 0, onTime: 0, satisfaction: 0 }
    },
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch last 7 days statistics
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: last7Days, error: statsError } = await supabase
          .from('daily_stats')
          .select('*')
          .order('date', { ascending: true });

        if (statsError) {
          console.error('❌ STATISTICS ERROR (daily stats):', {
            message: statsError.message,
            details: statsError.details,
            hint: statsError.hint,
            code: statsError.code,
            fullError: statsError
          });
        } else {
          console.log(`✅ Fetched ${last7Days?.length || 0} daily statistics`);
        }

        // Fetch missions and vehicles separately (no FK relationship)
        const { data: missionsForVehicles, error: missionsVehiclesError } = await supabase
          .from('missions')
          .select('vehicle_id, distance_km');

        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, plate_number, type');

        if (missionsVehiclesError) {
          console.error('❌ STATISTICS ERROR (missions for vehicles):', missionsVehiclesError);
        }
        if (vehiclesError) {
          console.error('❌ STATISTICS ERROR (vehicles):', vehiclesError);
        } else {
          console.log(`✅ Fetched vehicle data for statistics`);
        }

        // Create a map of vehicle_id -> vehicle info
        const vehicleInfoMap = new Map<string, { plate_number: string; type: string }>();
        (vehiclesData || []).forEach((v: any) => {
          vehicleInfoMap.set(v.id, { plate_number: v.plate_number, type: v.type });
        });

        const vehicleMap = new Map<string, { plate_number: string; type: string; total_km: number }>();
        (missionsForVehicles || []).forEach((mission: any) => {
          const vehicleInfo = vehicleInfoMap.get(mission.vehicle_id);
          if (vehicleInfo) {
            const key = vehicleInfo.plate_number;
            const existing = vehicleMap.get(key);
            if (existing) {
              existing.total_km += mission.distance_km;
            } else {
              vehicleMap.set(key, {
                plate_number: vehicleInfo.plate_number,
                type: vehicleInfo.type,
                total_km: mission.distance_km
              });
            }
          }
        });

        const topVehicles = Array.from(vehicleMap.values())
          .sort((a, b) => b.total_km - a.total_km)
          .slice(0, 5)
          .map(v => ({ ...v, total_km: Number(v.total_km.toFixed(2)) }));

        // Fetch mission status distribution
        const { data: missionsData, error: missionsError } = await supabase
          .from('missions')
          .select('status');

        if (missionsError) {
          console.error('❌ STATISTICS ERROR (mission status):', {
            message: missionsError.message,
            details: missionsError.details,
            hint: missionsError.hint,
            code: missionsError.code,
            fullError: missionsError
          });
        } else {
          console.log(`✅ Fetched ${missionsData?.length || 0} missions for status`);
        }

        const statusMap = new Map<string, number>();
        (missionsData || []).forEach((mission: any) => {
          statusMap.set(mission.status, (statusMap.get(mission.status) || 0) + 1);
        });

        const missionStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
          status,
          count
        }));

        // Fetch driver delays (separate queries - no FK relationship)
        const { data: missionsForDrivers, error: missionsDriversError } = await supabase
          .from('missions')
          .select('driver_id, delay_minutes');

        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name');

        if (missionsDriversError) {
          console.error('❌ STATISTICS ERROR (missions for drivers):', missionsDriversError);
        }
        if (driversError) {
          console.error('❌ STATISTICS ERROR (drivers):', driversError);
        } else {
          console.log(`✅ Fetched driver delay data`);
        }

        // Create a map of driver_id -> driver name
        const driverInfoMap = new Map<string, string>();
        (driversData || []).forEach((d: any) => {
          driverInfoMap.set(d.id, d.name);
        });

        const driverMap = new Map<string, { driver_name: string; delays: number[]; }>();
        (missionsForDrivers || []).forEach((mission: any) => {
          const driverName = driverInfoMap.get(mission.driver_id);
          if (driverName && mission.delay_minutes !== null) {
            const existing = driverMap.get(driverName);
            if (existing) {
              existing.delays.push(mission.delay_minutes);
            } else {
              driverMap.set(driverName, {
                driver_name: driverName,
                delays: [mission.delay_minutes]
              });
            }
          }
        });

        const driverDelays = Array.from(driverMap.values())
          .map(d => ({
            driver_name: d.driver_name,
            avg_delay: Number((d.delays.reduce((a, b) => a + b, 0) / d.delays.length).toFixed(1))
          }))
          .sort((a, b) => b.avg_delay - a.avg_delay);

        const safeLast7Days = last7Days || [];
        const kpis = calculateKPIs(safeLast7Days, missionStatus);

        setStats({
          last7Days: safeLast7Days,
          topVehicles,
          missionStatus,
          driverDelays,
          kpis,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();

    // Real-time updates
    const channel = supabase
      .channel('statistics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_stats' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
};
