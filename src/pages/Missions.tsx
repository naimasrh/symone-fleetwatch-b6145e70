import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-external";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import MissionFilters from "@/components/missions/MissionFilters";
import MissionDetailsDialog from "@/components/missions/MissionDetailsDialog";

interface Mission {
  id: string;
  origin_address: string;
  destination_address: string;
  status: string;
  delay_minutes: number;
  distance_km: number;
  scheduled_start: string;
  actual_start: string | null;
  scheduled_end: string;
  actual_end: string | null;
  driver_id: string;
  vehicle_id: string;
  driver_name?: string;
  vehicle_license_plate?: string;
}

const Missions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMissions();

    // Realtime subscription
    const channel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions'
        },
        () => {
          fetchMissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterMissions();
  }, [missions, selectedStatus]);

  const fetchMissions = async () => {
    console.log("🔄 Fetching missions from missions_enriched view");
    
    const { data, error } = await supabase
      .from('missions_enriched')
      .select('*');

    if (error) {
      console.error('❌ MISSIONS ERROR - Détails complets:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
    } else {
      console.log(`✅ Fetched ${data?.length || 0} missions from missions_enriched`);
      setMissions(data || []);
    }
    setIsLoading(false);
  };

  const filterMissions = () => {
    let filtered = [...missions];

    if (selectedStatus === "delayed") {
      filtered = filtered.filter(m => m.delay_minutes > 0 && (m.status === "in-progress" || m.status === "in_progress"));
    } else if (selectedStatus !== "all") {
      filtered = filtered.filter(m => m.status === selectedStatus);
    }

    setFilteredMissions(filtered);
  };

  const statusLabels: Record<string, string> = {
    'planned': 'Planifiées',
    'scheduled': 'Planifiées',
    'in-progress': 'En cours',
    'in_progress': 'En cours',
    'completed': 'Terminées',
    'cancelled': 'Annulées'
  };

  const getStatusBadge = (status: string) => {
    const label = statusLabels[status] || status;
    
    if (status === 'planned' || status === 'scheduled') {
      return <Badge variant="success">{label}</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="outline">{label}</Badge>;
    }
    if (status === 'in-progress' || status === 'in_progress') {
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">{label}</Badge>;
    }
    return <Badge>{label}</Badge>;
  };

  const handleViewDetails = (mission: Mission) => {
    setSelectedMission(mission);
    setShowDetails(true);
  };

  const handleViewOnMap = (mission: Mission) => {
    navigate('/', { state: { missionId: mission.id } });
  };

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return format(date, "HH:mm", { locale: fr });
  };
  if (isLoading) {
    return (
      <div className="p-3 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Toutes les missions</h1>
        <Badge variant="outline" className="text-sm md:text-lg px-3 md:px-4 py-1">
          {filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <MissionFilters
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Chauffeur</TableHead>
              <TableHead className="whitespace-nowrap">Véhicule</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Origine</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Destination</TableHead>
              <TableHead className="whitespace-nowrap hidden lg:table-cell">Départ prévu</TableHead>
              <TableHead className="whitespace-nowrap hidden lg:table-cell">Arrivée prévue</TableHead>
              <TableHead className="whitespace-nowrap">Statut</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Retard</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Aucune mission trouvée pour ce filtre
                </TableCell>
              </TableRow>
            ) : (
              filteredMissions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="font-medium whitespace-nowrap">{mission.driver_name || 'Non assigné'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <p className="font-medium">{mission.vehicle_license_plate || 'N/A'}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{mission.origin_address}</TableCell>
                  <TableCell className="hidden md:table-cell">{mission.destination_address}</TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap">{formatTime(mission.scheduled_start)}</TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap">{formatTime(mission.scheduled_end)}</TableCell>
                  <TableCell>{getStatusBadge(mission.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell whitespace-nowrap">
                    {mission.delay_minutes > 0 ? (
                      <span className={mission.delay_minutes > 15 ? 'text-red-500 font-medium' : 'text-orange-500'}>
                        +{mission.delay_minutes} min
                      </span>
                    ) : (
                      <span className="text-success font-medium">À l'heure</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(mission)}
                        className="h-8 w-8 md:h-9 md:w-9 p-0"
                      >
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOnMap(mission)}
                        className="h-8 w-8 md:h-9 md:w-9 p-0"
                      >
                        <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MissionDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        mission={selectedMission}
      />
    </div>
  );
};

export default Missions;
