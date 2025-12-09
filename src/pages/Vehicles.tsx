import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-external";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck } from "lucide-react";

interface Vehicle {
  id: string;
  [key: string]: any;
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');

      if (error) {
        console.error('❌ VEHICLES ERROR - Détails complets:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
      } else {
        console.log(`✅ Fetched ${data?.length || 0} vehicles`);
      }
      if (!error) {
        setVehicles(data || []);
      }
      setIsLoading(false);
    };

    fetchVehicles();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      'active': 'default',
      'maintenance': 'destructive',
      'inactive': 'secondary',
    };
    return variants[status] || 'default';
  };

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Véhicules</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <span className="text-base md:text-lg">{vehicle.id.substring(0, 8)}</span>
                </div>
                {vehicle.status && (
                  <Badge variant={getStatusBadge(vehicle.status)} className="text-xs">
                    {vehicle.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(vehicle).map(([key, value]) => {
                if (key === 'id' || key === 'created_at') return null;
                return (
                  <p key={key} className="text-xs md:text-sm">
                    <strong>{key}:</strong> {String(value)}
                  </p>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Vehicles;
