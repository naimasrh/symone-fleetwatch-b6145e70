import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-external";
import { useToast } from "@/hooks/use-toast";
import { Send, X } from "lucide-react";

interface Recommendation {
  id: string;
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

interface RecommendationCardProps {
  recommendation: Recommendation;
  onUpdate: () => void;
}

const RecommendationCard = ({ recommendation, onUpdate }: RecommendationCardProps) => {
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

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return <Badge className="bg-red-500 hover:bg-red-600">Élevée</Badge>;
    if (priority === 'medium') return <Badge className="bg-orange-500 hover:bg-orange-600">Moyenne</Badge>;
    return <Badge className="bg-blue-500 hover:bg-blue-600">Faible</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'sent') return <Badge className="bg-green-500 hover:bg-green-600">Envoyée</Badge>;
    if (status === 'dismissed') return <Badge variant="outline">Rejetée</Badge>;
    return <Badge variant="secondary">En attente</Badge>;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
              <span>{getTypeLabel(recommendation.type)}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Mission: {recommendation.missions.origin} → {recommendation.missions.destination}
            </p>
            <p className="text-xs text-muted-foreground">
              {recommendation.missions.drivers.name} • {recommendation.missions.vehicles.plate_number}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getPriorityBadge(recommendation.priority)}
            {getStatusBadge(recommendation.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{recommendation.message}</p>
        
        {recommendation.impact && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Impact estimé:</p>
            <p className="text-sm text-muted-foreground">{recommendation.impact}</p>
          </div>
        )}

        {recommendation.status === 'pending' && (
          <div className="flex gap-2">
            <Button onClick={handleSend} size="sm" className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Envoyer au chauffeur
            </Button>
            <Button onClick={handleDismiss} size="sm" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </div>
        )}

        {recommendation.sent_at && (
          <p className="text-xs text-muted-foreground">
            Envoyée le {new Date(recommendation.sent_at).toLocaleString('fr-FR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
