import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface MissionTimelineProps {
  scheduledStart: string;
  actualStart: string | null;
  scheduledEnd: string;
  actualEnd: string | null;
  delayMinutes: number;
}

const MissionTimeline = ({
  scheduledStart,
  actualStart,
  scheduledEnd,
  actualEnd,
  delayMinutes,
}: MissionTimelineProps) => {
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy à HH:mm", { locale: fr });
  };

  const getDelayBadge = (delay: number) => {
    if (delay === 0) return <Badge className="bg-green-500 hover:bg-green-600">À l'heure</Badge>;
    if (delay <= 15) return <Badge className="bg-orange-500 hover:bg-orange-600">+{delay} min</Badge>;
    return <Badge className="bg-red-500 hover:bg-red-600">+{delay} min</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <div className="w-0.5 h-12 bg-border" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">📍 Départ planifié</p>
          <p className="text-sm text-muted-foreground">{formatDateTime(scheduledStart)}</p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${actualStart ? 'bg-green-500' : 'bg-muted'}`} />
          <div className="w-0.5 h-12 bg-border" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">✅ Départ réel</p>
          <p className="text-sm text-muted-foreground">
            {actualStart ? formatDateTime(actualStart) : "En attente"}
          </p>
          {actualStart && delayMinutes > 0 && (
            <div className="mt-1">{getDelayBadge(delayMinutes)}</div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <div className="w-0.5 h-12 bg-border" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">🎯 Arrivée prévue</p>
          <p className="text-sm text-muted-foreground">{formatDateTime(scheduledEnd)}</p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${actualEnd ? 'bg-green-500' : 'bg-muted'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">✅ Arrivée réelle</p>
          <p className="text-sm text-muted-foreground">
            {actualEnd ? formatDateTime(actualEnd) : actualStart ? "En cours" : "En attente"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionTimeline;
