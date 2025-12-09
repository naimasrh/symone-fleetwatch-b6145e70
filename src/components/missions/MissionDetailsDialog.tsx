import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-external";
import MissionTimeline from "./MissionTimeline";
import SendRecommendationDialog from "./SendRecommendationDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

interface GPSPosition {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

interface MissionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission | null;
}

const MissionDetailsDialog = ({ open, onOpenChange, mission }: MissionDetailsDialogProps) => {
  const [gpsPosition, setGpsPosition] = useState<GPSPosition | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    if (mission && open) {
      fetchGPSPosition();
    }
  }, [mission, open]);

  const fetchGPSPosition = async () => {
    if (!mission) return;

    const { data, error } = await supabase
      .from('gps_positions')
      .select('*')
      .eq('mission_id', mission.id)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching GPS position:', error);
    } else if (data && data.length > 0) {
      setGpsPosition(data[0]);
    }
  };

  const getStatusBadge = (status: string, delay: number) => {
    if (status === 'planned') return <Badge variant="secondary">Planifiée</Badge>;
    if (status === 'completed') return <Badge variant="outline">Terminée</Badge>;
    if (status === 'in-progress') {
      if (delay === 0) return <Badge className="bg-green-500 hover:bg-green-600">En cours</Badge>;
      if (delay <= 15) return <Badge className="bg-orange-500 hover:bg-orange-600">En retard</Badge>;
      return <Badge className="bg-red-500 hover:bg-red-600">En retard</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const generateRecommendations = () => {
    if (!mission) return [];

    const recommendations = [];

    if (mission.delay_minutes > 15) {
      recommendations.push({
        id: 'alt-route',
        text: "Itinéraire alternatif suggéré pour réduire le retard",
      });
      recommendations.push({
        id: 'notify-client',
        text: "Prévenir le client du retard estimé",
      });
    }

    if (mission.status === 'in-progress') {
      recommendations.push({
        id: 'break-reminder',
        text: "Prévoir une pause réglementaire dans 45 minutes",
      });
    }

    if (mission.distance_km > 200) {
      recommendations.push({
        id: 'fuel-check',
        text: "Vérifier le niveau de carburant avant de continuer",
      });
    }

    recommendations.push({
      id: 'traffic-alert',
      text: "Anticiper un trafic dense aux heures de pointe",
    });

    return recommendations;
  };

  if (!mission) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mission #{mission.id.substring(0, 8)}</DialogTitle>
            <DialogDescription>
              {mission.origin_address} → {mission.destination_address}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informations principales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations principales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Chauffeur:</span>
                  <span className="text-sm">{mission.driver_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Véhicule:</span>
                  <span className="text-sm">{mission.vehicle_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Distance:</span>
                  <span className="text-sm">{mission.distance_km} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Statut:</span>
                  {getStatusBadge(mission.status, mission.delay_minutes)}
                </div>
                {mission.delay_minutes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Retard:</span>
                    <span className="text-sm text-red-500">{mission.delay_minutes} minutes</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <MissionTimeline
                  scheduledStart={mission.scheduled_start}
                  actualStart={mission.actual_start}
                  scheduledEnd={mission.scheduled_end}
                  actualEnd={mission.actual_end}
                  delayMinutes={mission.delay_minutes}
                />
              </CardContent>
            </Card>

            {/* Position GPS */}
            {gpsPosition && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Position GPS actuelle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Coordonnées:</p>
                      <p className="text-sm text-muted-foreground">
                        {gpsPosition.latitude.toFixed(6)}, {gpsPosition.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Vitesse:</p>
                      <p className="text-sm text-muted-foreground">{gpsPosition.speed} km/h</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Direction:</p>
                      <p className="text-sm text-muted-foreground">{gpsPosition.heading}°</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dernière mise à jour:</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(gpsPosition.timestamp), "HH:mm:ss", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommandations IA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommandations IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {generateRecommendations().map((rec) => (
                  <div key={rec.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{rec.text}</p>
                  </div>
                ))}
                <Button 
                  onClick={() => setShowRecommendations(true)}
                  className="w-full mt-2"
                >
                  Envoyer des recommandations au chauffeur
                </Button>
              </CardContent>
            </Card>

            {/* Historique des incidents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Aucun incident signalé</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <SendRecommendationDialog
        open={showRecommendations}
        onOpenChange={setShowRecommendations}
        recommendations={generateRecommendations()}
        driverName={mission?.driver_id || 'Chauffeur'}
      />
    </>
  );
};

export default MissionDetailsDialog;
