import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  text: string;
}

interface SendRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: Recommendation[];
  driverName: string;
}

const SendRecommendationDialog = ({
  open,
  onOpenChange,
  recommendations,
  driverName,
}: SendRecommendationDialogProps) => {
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleRecommendation = (id: string) => {
    setSelectedRecommendations(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedRecommendations.length === 0) {
      toast({
        title: "Aucune recommandation sélectionnée",
        description: "Veuillez sélectionner au moins une recommandation.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Recommandations envoyées",
      description: `${selectedRecommendations.length} recommandation(s) envoyée(s) à ${driverName}`,
    });
    setSelectedRecommendations([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer des recommandations</DialogTitle>
          <DialogDescription>
            Sélectionnez les recommandations à envoyer à {driverName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3">
              <Checkbox
                id={rec.id}
                checked={selectedRecommendations.includes(rec.id)}
                onCheckedChange={() => toggleRecommendation(rec.id)}
              />
              <label
                htmlFor={rec.id}
                className="text-sm leading-relaxed cursor-pointer"
              >
                {rec.text}
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSend}>
            Envoyer par SMS/Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendRecommendationDialog;
