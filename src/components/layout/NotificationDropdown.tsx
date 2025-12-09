import { Bell, Clock, CalendarCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const NotificationItem = ({ 
  notification, 
  onClick 
}: { 
  notification: Notification;
  onClick: () => void;
}) => {
  const isDelay = notification.type === 'delay';
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors text-left"
    >
      <div className={cn(
        "p-2 rounded-full shrink-0",
        isDelay ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      )}>
        {isDelay ? <Clock className="h-4 w-4" /> : <CalendarCheck className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
      </div>
      {isDelay && notification.delayMinutes && (
        <Badge variant="destructive" className="shrink-0">
          +{notification.delayMinutes} min
        </Badge>
      )}
    </button>
  );
};

export const NotificationDropdown = () => {
  const { delayNotifications, plannedNotifications, totalCount, loading } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (missionId: string) => {
    navigate(`/missions`);
  };

  const handleViewAll = () => {
    navigate('/missions');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-1 hover:opacity-80 transition-opacity">
          <Bell className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
          {totalCount > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                totalCount > 0 && "animate-pulse"
              )}
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-popover border-border" 
        align="end"
        sideOffset={8}
      >
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <p className="text-xs text-muted-foreground">
            {totalCount} notification{totalCount !== 1 ? 's' : ''} active{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : totalCount === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className="p-2">
              {delayNotifications.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-xs font-medium text-destructive uppercase tracking-wide">
                      Retards ({delayNotifications.length})
                    </span>
                  </div>
                  {delayNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification.missionId)}
                    />
                  ))}
                </div>
              )}

              {plannedNotifications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      Missions planifiées ({plannedNotifications.length})
                    </span>
                  </div>
                  {plannedNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification.missionId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {totalCount > 0 && (
          <div className="p-2 border-t border-border">
            <button
              onClick={handleViewAll}
              className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Voir toutes les missions →
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
