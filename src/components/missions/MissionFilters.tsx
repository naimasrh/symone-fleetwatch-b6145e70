import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MissionFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const MissionFilters = ({ selectedStatus, onStatusChange }: MissionFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
      <label className="text-sm font-medium whitespace-nowrap">Filtrer par statut:</label>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          <SelectItem value="planned">Planifiées</SelectItem>
          <SelectItem value="in-progress">En cours</SelectItem>
          <SelectItem value="completed">Terminées</SelectItem>
          <SelectItem value="delayed">En retard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MissionFilters;
