import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-external";
import { useToast } from "@/hooks/use-toast";
import { Send, X, Eye, Clock, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
    drivers: { name: string };
    vehicles: { plate_number: string };
  };
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onUpdate: () => void;
  onViewMission: () => void;
}

const RecommendationCard = ({ recommendation, onUpdate, onViewMission }: RecommendationCardProps) => {
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speed': return '🚗';
      case 'break': return '☕';
      case 'route': return '🛣️';
      case 'client_notification': return '📱';
      default: return '💡';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'speed': return 'Vitesse';
      case 'break': return 'Pause';
      case 'route': return 'Itinéraire';
      case 'client_notification': return 'Notification client';
      default: return type;
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { 
          badge: <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Élevée</Badge>,
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />
        };
      case 'medium':
        return { 
          badge: <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">Moyenne</Badge>,
          icon: <Info className="h-4 w-4 text-orange-500" />
        };
      default:
        return { 
          badge: <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Faible</Badge>,
          icon: <Info className="h-4 w-4 text-blue-500" />
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sent':
        return {
          badge: <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Envoyée</Badge>,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          bgClass: "border-l-green-500"
        };
      case 'dismissed':
        return {
          badge: <Badge variant="outline" className="text-muted-foreground">Rejetée</Badge>,
          icon: <X className="h-4 w-4 text-muted-foreground" />,
          bgClass: "border-l-muted-foreground opacity-60"
        };
      default:
        return {
          badge: <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse">En attente</Badge>,
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          bgClass: "border-l-amber-500"
        };
    }
  };

  const handleSend = async () => {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', recommendation.id);

    if (error) {
      console.error('Error sending recommendation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la recommandation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recommandation envoyée",
        description: `Envoyée à ${recommendation.missions.drivers.name}`,
      });
      onUpdate();
    }
  };

  const handleDismiss = async () => {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ status: 'dismissed' })
      .eq('id', recommendation.id);

    if (error) {
      console.error('Error dismissing recommendation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la recommandation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recommandation rejetée",
        description: "La recommandation a été rejetée",
      });
      onUpdate();
    }
  };

  const statusConfig = getStatusConfig(recommendation.status);
  const priorityConfig = getPriorityConfig(recommendation.priority);

  return (
    <Card className={`relative overflow-hidden border-l-4 ${statusConfig.bgClass} transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        {/* Type and Status Row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
            <div>
              <p className="font-semibold text-sm">{getTypeLabel(recommendation.type)}</p>
              <p className="text-xs text-muted-foreground">
                ID: {recommendation.mission_id.substring(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {statusConfig.badge}
            {priorityConfig.badge}
          </div>
        </div>

        {/* Mission Info */}
        <div className="mt-3 p-2 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">
            {recommendation.missions.origin} → {recommendation.missions.destination}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            👤 {recommendation.missions.drivers.name} • 🚐 {recommendation.missions.vehicles.plate_number}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {/* Message */}
        <p className="text-sm leading-relaxed">{recommendation.message}</p>
        
        {/* Impact */}
        {recommendation.impact && (
          <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs font-medium text-primary mb-1">Impact estimé</p>
            <p className="text-xs text-muted-foreground">{recommendation.impact}</p>
          </div>
        )}

        {/* View Mission Button */}
        <Button 
          onClick={onViewMission} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          Voir les détails de la mission
        </Button>

        {/* Action Buttons for Pending */}
        {recommendation.status === 'pending' && (
          <div className="flex gap-2">
            <Button onClick={handleSend} size="sm" className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
            <Button onClick={handleDismiss} size="sm" variant="ghost" className="text-muted-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Sent timestamp */}
        {recommendation.sent_at && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded-lg">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              Envoyée le {format(new Date(recommendation.sent_at), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
            </span>
          </div>
        )}

        {/* Created timestamp */}
        <p className="text-xs text-muted-foreground text-right">
          Créée {formatDistanceToNow(new Date(recommendation.created_at), { addSuffix: true, locale: fr })}
        </p>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
