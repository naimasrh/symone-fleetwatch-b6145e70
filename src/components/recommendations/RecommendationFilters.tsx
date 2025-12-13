import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecommendationFiltersProps {
  selectedPriority: string;
  selectedStatus: string;
  selectedType: string;
  onPriorityChange: (priority: string) => void;
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
}

const RecommendationFilters = ({
  selectedPriority,
  selectedStatus,
  selectedType,
  onPriorityChange,
  onStatusChange,
  onTypeChange,
}: RecommendationFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-[200px]">
        <label className="text-sm font-medium whitespace-nowrap">Priorité:</label>
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="élevé">Élevée</SelectItem>
            <SelectItem value="moyen">Moyenne</SelectItem>
            <SelectItem value="faible">Faible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-[200px]">
        <label className="text-sm font-medium whitespace-nowrap">Statut:</label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="sent">Envoyées</SelectItem>
            <SelectItem value="dismissed">Rejetées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-[200px]">
        <label className="text-sm font-medium whitespace-nowrap">Type:</label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="ajustement_vitesse">🚗 Vitesse</SelectItem>
            <SelectItem value="suggestion_pause">☕ Pause</SelectItem>
            <SelectItem value="changement_itineraire">🛣️ Itinéraire</SelectItem>
            <SelectItem value="notification_client">📱 Client</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RecommendationFilters;
