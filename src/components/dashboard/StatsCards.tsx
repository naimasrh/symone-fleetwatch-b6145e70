import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Leaf, Clock, Truck, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-external";

interface Statistics {
  total_km: number;
  total_co2_kg: number;
  total_delay_minutes: number;
  completed_missions: number;
  total_missions: number;
  incidents_resolved: number;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ STATS CARDS ERROR - Détails complets:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        return;
      }

      if (data) {
        const normalized: Statistics = {
          total_km: Number(data.total_km ?? 0),
          total_co2_kg: Number(data.total_co2_kg ?? 0),
          total_delay_minutes: Number(data.total_delay_minutes ?? 0),
          completed_missions: Number(data.completed_missions ?? 0),
          total_missions: Number(data.total_missions ?? 0),
          incidents_resolved: Number(data.incidents_resolved ?? 0),
        };
        console.log('✅ Stats card data fetched (normalised):', normalized);
        setStats(normalized);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return null;
  }

  const statsData = [
    {
      icon: Gauge,
      label: "Kilomètres parcourus",
      value: `${stats.total_km.toFixed(1)} km`,
      color: "text-info",
      borderColor: "info",
      bgColor: "bg-info/5",
    },
    {
      icon: Leaf,
      label: "CO₂ économisé",
      value: `${stats.total_co2_kg.toFixed(1)} kg`,
      color: "text-success",
      borderColor: "success",
      bgColor: "bg-success/5",
    },
    {
      icon: Clock,
      label: "Retards cumulés",
      value: `${stats.total_delay_minutes} min`,
      color: stats.total_delay_minutes > 30 ? "text-danger" : stats.total_delay_minutes > 15 ? "text-warning" : "text-success",
      borderColor: stats.total_delay_minutes > 30 ? "danger" : stats.total_delay_minutes > 15 ? "warning" : "success",
      bgColor: stats.total_delay_minutes > 30 ? "bg-danger/5" : stats.total_delay_minutes > 15 ? "bg-warning/5" : "bg-success/5",
    },
    {
      icon: Truck,
      label: "Missions",
      value: `${stats.completed_missions} / ${stats.total_missions}`,
      color: "text-info",
      borderColor: "info",
      bgColor: "bg-info/5",
    },
    {
      icon: CheckCircle,
      label: "Incidents résolus",
      value: stats.incidents_resolved.toString(),
      color: "text-success",
      borderColor: "success",
      bgColor: "bg-success/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
      {statsData.map((stat, index) => (
        <Card 
          key={index} 
          className={`hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 ${stat.bgColor}`}
          style={{ borderLeftColor: `hsl(var(--${stat.borderColor}))` }}
        >
          <CardContent className="pt-4 md:pt-6 pb-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <stat.icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.color}`} />
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
