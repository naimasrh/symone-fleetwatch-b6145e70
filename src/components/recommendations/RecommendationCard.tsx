import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-external";
import { useToast } from "@/hooks/use-toast";
import { Send, Eye, Clock, CheckCircle, AlertTriangle, Route, Coffee, Bell, Lightbulb, Car } from "lucide-react";
import { format } from "date-fns";
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
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onUpdate: () => void;
  onViewMission: (missionId: string) => void;
}

// Traductions
const typeTranslations: Record<string, string> = {
  'speed': 'Ajustement de vitesse',
  'break': 'Suggestion de pause',
  'route': 'Changement d\'itinéraire',
  'client_notification': 'Notification client',
  'changement_itineraire': 'Changement d\'itinéraire',
  'notification_client': 'Notification client',
  'ajustement_vitesse': 'Ajustement de vitesse',
  'suggestion_pause': 'Suggestion de pause',
};

const priorityTranslations: Record<string, string> = {
  'high': 'Élevée',
  'medium': 'Moyenne',
  'low': 'Faible',
};

const statusTranslations: Record<string, string> = {
  'pending': 'En attente',
  'sent': 'Envoyée',
  'dismissed': 'Rejetée',
};

const RecommendationCard = ({ recommendation, onUpdate, onViewMission }: RecommendationCardProps) => {
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speed':
      case 'ajustement_vitesse':
        return <Car className="h-5 w-5" />;
      case 'break':
      case 'suggestion_pause':
        return <Coffee className="h-5 w-5" />;
      case 'route':
      case 'changement_itineraire':
        return <Route className="h-5 w-5" />;
      case 'client_notification':
      case 'notification_client':
        return <Bell className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return typeTranslations[type] || type;
  };

  const getPriorityBadge = (priority: string) => {
    const label = priorityTranslations[priority] || priority;
    if (priority === 'high') {
      return <Badge className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{label}</Badge>;
    }
    if (priority === 'medium') {
      return <Badge className="bg-warning hover:bg-warning/90 text-warning-foreground">{label}</Badge>;
    }
    return <Badge className="bg-info hover:bg-info/90 text-info-foreground">{label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const label = statusTranslations[status] || status;
    if (status === 'sent') {
      return (
        <Badge className="bg-success hover:bg-success/90 text-success-foreground gap-1">
          <CheckCircle className="h-3 w-3" />
          {label}
        </Badge>
      );
    }
    if (status === 'dismissed') {
      return (
        <Badge variant="outline" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {label}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const handleSend = async () => {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
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
        description: "La recommandation a été envoyée avec succès",
      });
      onUpdate();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getTypeIcon(recommendation.type)}
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {getTypeLabel(recommendation.type)}
              </h3>
              <p className="text-xs text-muted-foreground">
                Mission: #{recommendation.mission_id.substring(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {getPriorityBadge(recommendation.priority)}
            {getStatusBadge(recommendation.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Message</p>
          <p className="text-sm">{recommendation.message}</p>
        </div>

        {/* Impact */}
        {recommendation.impact && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">Impact estimé</p>
            <p className="text-sm">{recommendation.impact}</p>
          </div>
        )}

        {/* Date d'envoi si envoyée */}
        {recommendation.sent_at && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-success" />
            Envoyée le {format(new Date(recommendation.sent_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        )}

        {/* Date de création */}
        <p className="text-xs text-muted-foreground">
          Créée le {format(new Date(recommendation.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewMission(recommendation.mission_id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir la mission
          </Button>
          
          {recommendation.status === 'pending' && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleSend}
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer au chauffeur
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;