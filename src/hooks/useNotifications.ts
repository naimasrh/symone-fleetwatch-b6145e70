import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-external';

export interface Notification {
  id: string;
  type: 'delay' | 'planned';
  title: string;
  message: string;
  timestamp: Date;
  missionId: string;
  delayMinutes?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // Fetch delayed missions (in-progress with delay > 0) - using missions table directly
      const { data: delayedMissions, error: delayError } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'in_progress')
        .gt('delay_minutes', 0)
        .order('delay_minutes', { ascending: false });

      if (delayError) throw delayError;

      // Fetch planned missions
      const { data: plannedMissions, error: plannedError } = await supabase
        .from('missions')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_start', { ascending: true });

      if (plannedError) throw plannedError;

      const delayNotifications: Notification[] = (delayedMissions || []).map((mission) => ({
        id: `delay-${mission.id}`,
        type: 'delay' as const,
        title: 'Mission en retard',
        message: `${mission.origin_address} → ${mission.destination_address} : ${mission.delay_minutes} min de retard`,
        timestamp: new Date(mission.scheduled_start || Date.now()),
        missionId: mission.id!,
        delayMinutes: mission.delay_minutes || 0,
      }));

      const plannedNotifications: Notification[] = (plannedMissions || []).map((mission) => ({
        id: `planned-${mission.id}`,
        type: 'planned' as const,
        title: 'Mission planifiée',
        message: `${mission.origin_address} → ${mission.destination_address}`,
        timestamp: new Date(mission.created_at || Date.now()),
        missionId: mission.id!,
      }));

      setNotifications([...delayNotifications, ...plannedNotifications]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime changes on missions
    const channel = supabase
      .channel('notifications-missions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const delayNotifications = notifications.filter((n) => n.type === 'delay');
  const plannedNotifications = notifications.filter((n) => n.type === 'planned');

  return {
    notifications,
    delayNotifications,
    plannedNotifications,
    totalCount: notifications.length,
    loading,
    refresh: fetchNotifications,
  };
};
