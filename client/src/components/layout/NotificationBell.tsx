import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifications = [] } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.entity_type === 'CHALLAN' && notification.entity_id) {
      navigate(`/challans/${notification.entity_id}`);
    } else if (notification.entity_type === 'CUSTOMER' && notification.entity_id) {
      navigate(`/customers/${notification.entity_id}`);
    } else if (notification.entity_type === 'PRODUCT' && notification.entity_id) {
      navigate(`/products/${notification.entity_id}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon-sm" 
        className="relative" 
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-bg-white border border-border-subtle rounded-[var(--radius-lg)] shadow-lg z-50 flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-primary rounded-t-[var(--radius-lg)]">
            <h3 className="font-semibold text-text-primary text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-accent-primary hover:text-accent-secondary flex items-center gap-1 font-medium transition-colors"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 space-y-0.5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-border-default opacity-50" />
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-[var(--radius-md)] transition-colors group flex items-start gap-3",
                    !n.is_read ? "bg-[#F0F7F0] hover:bg-[#E8F3E8]" : "hover:bg-bg-muted"
                  )}
                >
                  <div className={cn(
                    "mt-1 w-2 h-2 rounded-full shrink-0", 
                    !n.is_read ? "bg-accent-primary" : "bg-transparent"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm tracking-tight mb-0.5", 
                      !n.is_read ? "font-semibold text-text-primary" : "font-medium text-text-secondary"
                    )}>
                      {n.title}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-1.5 pr-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-text-muted/70 font-medium">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
