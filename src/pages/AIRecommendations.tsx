import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-external";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import RecommendationFilters from "@/components/recommendations/RecommendationFilters";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import MissionDetailsDialog from "@/components/missions/MissionDetailsDialog";

interface Recommendation {
  id: string;
  mission_id: string;
  type: string;
  message: string;
  impact: string | null;
  priority: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

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
}

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  
  // Dialog state
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecommendations();

    // Realtime subscription
    const channel = supabase
      .channel('recommendations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_recommendations'
        },
        () => {
          fetchRecommendations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterRecommendations();
  }, [recommendations, selectedPriority, selectedStatus, selectedType]);

  const fetchRecommendations = async () => {
    // Récupérer uniquement les recommandations des dernières 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('id, mission_id, type, message, impact, priority, status, sent_at, created_at')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ RECOMMENDATIONS ERROR:', error);
    } else {
      console.log(`✅ Fetched ${data?.length || 0} recommendations (last 24h)`);
      setRecommendations(data || []);
    }
    setIsLoading(false);
  };

  const filterRecommendations = () => {
    let filtered = [...recommendations];

    if (selectedPriority !== "all") {
      filtered = filtered.filter(r => r.priority === selectedPriority);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    setFilteredRecommendations(filtered);
  };

  const handleViewMission = async (missionId: string) => {
    // Fetch mission details from mission_enriched view
    const { data, error } = await supabase
      .from('mission_enriched')
      .select('*')
      .eq('id', missionId)
      .single();

    if (error) {
      console.error('Error fetching mission:', error);
      return;
    }

    if (data) {
      setSelectedMission({
        id: data.id,
        origin_address: data.origin || '',
        destination_address: data.destination || '',
        status: data.status || 'planned',
        delay_minutes: data.delay_minutes || 0,
        distance_km: data.distance_km || 0,
        scheduled_start: data.scheduled_start || '',
        actual_start: data.actual_start,
        scheduled_end: data.scheduled_end || '',
        actual_end: data.actual_end,
        driver_id: data.driver_id || '',
        vehicle_id: data.vehicle_id || '',
      });
      setDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48 md:w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Recommandations IA</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Recommandations générées automatiquement (dernières 24h)
          </p>
        </div>
        <Badge variant="outline" className="text-sm md:text-lg px-3 md:px-4 py-1 justify-center">
          {filteredRecommendations.length} recommandation{filteredRecommendations.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <RecommendationFilters
        selectedPriority={selectedPriority}
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onPriorityChange={setSelectedPriority}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
      />

      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground text-base md:text-lg">Aucune recommandation trouvée</p>
          <p className="text-muted-foreground text-sm mt-2">Les recommandations apparaissent ici pendant 24h après leur création</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onUpdate={fetchRecommendations}
              onViewMission={handleViewMission}
            />
          ))}
        </div>
      )}

      <MissionDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mission={selectedMission}
      />
    </div>
  );
};

export default AIRecommendations;