import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Notification } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, AlertTriangle, MessageSquare, Shield, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const iconMap = {
  warning: AlertTriangle,
  danger: Shield,
  message: MessageSquare,
  info: Info,
};

const colorMap = {
  warning: 'text-warning bg-warning/10',
  danger: 'text-destructive bg-destructive/10',
  message: 'text-primary bg-primary/10',
  info: 'text-muted-foreground bg-muted',
};

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();

      const unsub = socketClient.on('new_notification', (data) => {
        const notif = data as Notification;
        setNotifications(prev => [notif, ...prev]);
      });

      return () => unsub();
    }
  }, [user]);

  const loadNotifications = async () => {
    const { data } = await api.getNotifications();
    if (data) setNotifications(data.notifications);
  };

  const markAsRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map(notif => {
                const Icon = iconMap[notif.type as keyof typeof iconMap] || Info;
                const color = colorMap[notif.type as keyof typeof colorMap] || colorMap.info;
                
                return (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      'w-full flex gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted',
                      !notif.is_read && 'bg-primary/5'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('font-medium text-sm', !notif.is_read && 'text-foreground')}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                notifications.forEach(n => {
                  if (!n.is_read) markAsRead(n.id);
                });
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
