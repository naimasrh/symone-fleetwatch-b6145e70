import { FleetMap } from "@/components/dashboard/FleetMap";
import { StatsCards } from "@/components/dashboard/StatsCards";

const Index = () => {
  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-museo mb-3 md:mb-4 text-foreground">Carte de la Flotte</h2>
        <FleetMap />
      </div>
      
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-museo mb-3 md:mb-4 text-foreground">Statistiques Temps Réel</h2>
        <StatsCards />
      </div>
    </div>
  );
};

export default Index;
