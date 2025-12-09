import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, MapPin, Leaf, Clock, Star, TrendingUp, Truck } from "lucide-react";
import { useStatistics } from "@/hooks/useStatistics";
import { KPICard } from "@/components/statistics/KPICard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, CartesianGrid, XAxis, YAxis, Cell, Legend } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "sonner";

const Statistics = () => {
  const { last7Days, topVehicles, missionStatus, driverDelays, kpis, loading } = useStatistics();

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text('Rapport Statistiques', 20, 20);
    doc.setFontSize(12);
    doc.text(`Genere le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 20, 30);
    
    // KPIs
    doc.setFontSize(14);
    doc.text('Indicateurs Cles', 20, 45);
    autoTable(doc, {
      startY: 50,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Missions semaine', `${kpis.weeklyMissions}`],
        ['CO2 economise', `${kpis.totalCO2} kg`],
        ['Taux de ponctualite', `${kpis.onTimeRate}%`],
        ['Satisfaction client', `${kpis.customerSat}/5`]
      ]
    });
    
    // Tableau des véhicules
    const finalY1 = (doc as any).lastAutoTable.finalY;
    doc.text('Top 5 Vehicules', 20, finalY1 + 15);
    autoTable(doc, {
      startY: finalY1 + 20,
      head: [['Vehicule', 'Kilometres']],
      body: topVehicles.map(v => [v.plate_number, `${v.total_km} km`])
    });
    
    // Tableau des chauffeurs
    const finalY2 = (doc as any).lastAutoTable.finalY;
    doc.text('Retards par Chauffeur', 20, finalY2 + 15);
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['Chauffeur', 'Retard moyen (min)']],
      body: driverDelays.map(d => [d.driver_name, d.avg_delay.toFixed(1)])
    });
    
    // Sauvegarder
    doc.save(`rapport-statistiques-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success("Rapport PDF généré avec succès");
  };

  const statusLabels: Record<string, string> = {
    'planned': 'Planifiées',
    'scheduled': 'Planifiées',      // Format BDD externe
    'in-progress': 'En cours',
    'in_progress': 'En cours',      // Format BDD externe (underscore)
    'completed': 'Terminées',
    'cancelled': 'Annulées'
  };

  const statusColorMap: Record<string, string> = {
    'planned': 'hsl(var(--success))',
    'scheduled': 'hsl(var(--success))',      // Vert pour Planifiées
    'in-progress': 'hsl(var(--secondary))', 
    'in_progress': 'hsl(var(--secondary))',  // Format underscore
    'completed': 'hsl(var(--info))',
    'cancelled': 'hsl(var(--danger))'
  };

  const statusColors = ['hsl(var(--info))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--danger))'];

  const missionStatusWithLabels = missionStatus.map(s => ({
    ...s,
    label: statusLabels[s.status] || s.status,
    fill: statusColorMap[s.status] || statusColors[0]
  }));

  // Fonctions pour déterminer les couleurs en fonction des valeurs
  const getCO2Color = () => ({
    color: "text-success",
    bg: "bg-success/10"
  });

  const getOnTimeColor = (rate: number) => {
    if (rate >= 90) return { color: "text-success", bg: "bg-success/10" };
    if (rate >= 70) return { color: "text-warning", bg: "bg-warning/10" };
    return { color: "text-danger", bg: "bg-danger/10" };
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4.5) return { color: "text-success", bg: "bg-success/10" };
    if (rating >= 3.5) return { color: "text-warning", bg: "bg-warning/10" };
    return { color: "text-danger", bg: "bg-danger/10" };
  };

  const getDelayColor = (avgDelay: number) => {
    if (avgDelay <= 5) return "hsl(var(--success))";
    if (avgDelay <= 15) return "hsl(var(--warning))";
    return "hsl(var(--danger))";
  };

  if (loading) {
    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Skeleton className="h-8 md:h-10 w-48 md:w-64" />
          <Skeleton className="h-9 md:h-10 w-40 md:w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[300px] md:h-[350px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold font-museo">Statistiques Avancées</h1>
        <Button onClick={generatePDF} variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Télécharger PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          title="Missions cette semaine"
          value={kpis.weeklyMissions}
          icon={MapPin}
          change={kpis.comparison.missions}
          colorClass="text-info"
          bgColorClass="bg-info/10"
        />
        <KPICard
          title="CO₂ économisé"
          value={kpis.totalCO2}
          icon={Leaf}
          change={kpis.comparison.co2}
          suffix="kg"
          colorClass={getCO2Color().color}
          bgColorClass={getCO2Color().bg}
        />
        <KPICard
          title="Taux de ponctualité"
          value={kpis.onTimeRate}
          icon={Clock}
          change={kpis.comparison.onTime}
          suffix="%"
          colorClass={getOnTimeColor(kpis.onTimeRate).color}
          bgColorClass={getOnTimeColor(kpis.onTimeRate).bg}
        />
        <KPICard
          title="Satisfaction client"
          value={kpis.customerSat}
          icon={Star}
          change={kpis.comparison.satisfaction}
          suffix="/5"
          colorClass={getSatisfactionColor(kpis.customerSat).color}
          bgColorClass={getSatisfactionColor(kpis.customerSat).bg}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* CO2 Evolution */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Leaf className="h-4 w-4 md:h-5 md:w-5 text-success" />
              Évolution CO₂ (7 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {last7Days.length > 0 ? (
              <ChartContainer
                config={{
                  co2_saved: {
                    label: "CO₂ économisé (kg)",
                    color: "hsl(var(--success))"
                  }
                }}
                className="h-[250px] md:h-[300px]"
              >
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: fr })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="co2_saved"
                    stroke="var(--color-co2_saved)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-co2_saved)", r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Données en cours de collecte
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kilometers by Vehicle */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Truck className="h-4 w-4 md:h-5 md:w-5 text-info" />
              Kilomètres par Véhicule (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topVehicles.length > 0 ? (
              <ChartContainer
                config={{
                  total_km: {
                    label: "Kilomètres",
                    color: "hsl(var(--info))"
                  }
                }}
                className="h-[250px] md:h-[300px]"
              >
                <BarChart data={topVehicles}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="plate_number" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total_km" fill="hsl(var(--info))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mission Distribution */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Répartition des Missions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {missionStatusWithLabels.length > 0 ? (
              <>
                <ChartContainer
                  config={Object.fromEntries(
                    missionStatus.map((s) => [
                      s.status,
                      { label: statusLabels[s.status] || s.status, color: statusColorMap[s.status] || statusColors[0] }
                    ])
                  )}
                  className="h-[250px] md:h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={missionStatusWithLabels}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      label
                    >
                      {missionStatusWithLabels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColorMap['planned'] }} />
                    <span className="text-muted-foreground">Planifiées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColorMap['in-progress'] }} />
                    <span className="text-muted-foreground">En cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColorMap['completed'] }} />
                    <span className="text-muted-foreground">Terminées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColorMap['cancelled'] }} />
                    <span className="text-muted-foreground">Annulées</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune mission disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Delays */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              Retards Moyens par Chauffeur
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driverDelays.length > 0 ? (
              <ChartContainer
                config={{
                  avg_delay: {
                    label: "Retard moyen (min)",
                    color: "hsl(var(--warning))"
                  }
                }}
                className="h-[250px] md:h-[300px]"
              >
                <BarChart data={driverDelays} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="driver_name" width={80} className="text-[10px] md:text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avg_delay" radius={[0, 8, 8, 0]}>
                    {driverDelays.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getDelayColor(entry.avg_delay)} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée de retard disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
