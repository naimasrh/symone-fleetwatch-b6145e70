import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-external";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import RecommendationFilters from "@/components/recommendations/RecommendationFilters";
import RecommendationCard from "@/components/recommendations/RecommendationCard";

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
  missions: {
    origin: string;
    destination: string;
    drivers: { name: string };
    vehicles: { plate_number: string };
  };
}

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

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
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select(`
        *,
        missions (
          origin,
          destination,
          drivers (name),
          vehicles (plate_number)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ RECOMMENDATIONS ERROR - Détails complets:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
    } else {
      console.log(`✅ Fetched ${data?.length || 0} recommendations`);
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

  // Group recommendations by mission
  const groupedRecommendations = filteredRecommendations.reduce((acc, rec) => {
    const key = `${rec.missions.origin} → ${rec.missions.destination}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Recommandations IA</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Recommandations générées automatiquement pour optimiser les missions
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
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {Object.entries(groupedRecommendations).map(([missionKey, recs]) => (
            <div key={missionKey}>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">{missionKey}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {recs.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onUpdate={fetchRecommendations}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
