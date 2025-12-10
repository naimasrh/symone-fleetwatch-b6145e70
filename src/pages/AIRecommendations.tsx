import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-external";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import RecommendationFilters from "@/components/recommendations/RecommendationFilters";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import MissionDetailsDialog from "@/components/missions/MissionDetailsDialog";
import { Brain } from "lucide-react";

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
  mission_enriched: {
    id: string;
    origin: string;
    destination: string;
    status: string;
    delay_minutes: number;
    distance_km: number;
    scheduled_start: string;
    actual_start: string | null;
    scheduled_end: string;
    actual_end: string | null;
    driver_id: string;
    vehicle_id: string;
    driver_name: string | null;
    plate_number: string | null;
  } | null;
}

interface MissionForDialog {
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
  
  // Mission details dialog state
  const [showMissionDetails, setShowMissionDetails] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionForDialog | null>(null);

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
    // Calculate 24h ago timestamp
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Use the enriched view which already has driver_name and plate_number
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select(`
        *,
        mission_enriched!ai_recommendations_mission_id_fkey (
          id,
          origin,
          destination,
          status,
          delay_minutes,
          distance_km,
          scheduled_start,
          actual_start,
          scheduled_end,
          actual_end,
          driver_id,
          vehicle_id,
          driver_name,
          plate_number
        )
      `)
      .gte('created_at', twentyFourHoursAgo.toISOString())
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

  const handleViewMission = (recommendation: Recommendation) => {
    const mission = recommendation.mission_enriched;
    if (!mission) return;
    
    setSelectedMission({
      id: mission.id,
      origin_address: mission.origin,
      destination_address: mission.destination,
      status: mission.status,
      delay_minutes: mission.delay_minutes,
      distance_km: mission.distance_km,
      scheduled_start: mission.scheduled_start,
      actual_start: mission.actual_start,
      scheduled_end: mission.scheduled_end,
      actual_end: mission.actual_end,
      driver_id: mission.driver_id,
      vehicle_id: mission.vehicle_id,
    });
    setShowMissionDetails(true);
  };

  // Count by status
  const pendingCount = filteredRecommendations.filter(r => r.status === 'pending').length;
  const sentCount = filteredRecommendations.filter(r => r.status === 'sent').length;
  const dismissedCount = filteredRecommendations.filter(r => r.status === 'dismissed').length;

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48 md:w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-56 md:h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Recommandations IA</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Recommandations des dernières 24h • Mise à jour en temps réel
            </p>
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {pendingCount} en attente
          </Badge>
          <Badge className="bg-green-500 hover:bg-green-600 text-sm px-3 py-1">
            {sentCount} envoyée{sentCount > 1 ? 's' : ''}
          </Badge>
          {dismissedCount > 0 && (
            <Badge variant="outline" className="text-sm px-3 py-1">
              {dismissedCount} rejetée{dismissedCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
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
        <div className="text-center py-12 md:py-16">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-base md:text-lg">
            Aucune recommandation dans les dernières 24h
          </p>
          <p className="text-muted-foreground/70 text-sm mt-1">
            Les nouvelles recommandations apparaîtront ici automatiquement
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onUpdate={fetchRecommendations}
              onViewMission={() => handleViewMission(rec)}
            />
          ))}
        </div>
      )}

      {/* Mission Details Dialog */}
      <MissionDetailsDialog
        open={showMissionDetails}
        onOpenChange={setShowMissionDetails}
        mission={selectedMission}
      />
    </div>
  );
};

export default AIRecommendations;
