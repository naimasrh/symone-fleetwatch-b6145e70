import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  suffix?: string;
  colorClass?: string;
  bgColorClass?: string;
}

export const KPICard = ({ title, value, icon: Icon, change, suffix, colorClass = "text-primary", bgColorClass = "bg-primary/10" }: KPICardProps) => {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined && change !== 0;

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: `hsl(var(${colorClass.replace('text-', '--')}))` }}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={cn("text-4xl font-bold", colorClass)}>
                {value}
              </h3>
              {suffix && (
                <span className="text-lg text-muted-foreground">{suffix}</span>
              )}
            </div>
            {hasChange && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-success" : "text-danger"
                )}>
                  {isPositive ? '+' : ''}{change}% vs hier
                </span>
              </div>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", bgColorClass)}>
            <Icon className={cn("h-6 w-6", colorClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
