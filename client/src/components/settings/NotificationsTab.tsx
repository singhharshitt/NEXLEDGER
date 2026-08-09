import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useNotifications';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NotificationsTab() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  
  const [localSettings, setLocalSettings] = useState({
    notify_challan: true,
    notify_stock: true,
    notify_customer: true,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  const handleToggle = (key: keyof typeof localSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateSettings.mutate(localSettings);
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Notification Preferences</h2>
        <p className="text-sm text-text-muted mt-1">
          Choose what events you want to be notified about.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between space-x-4 border-b border-border-subtle pb-6">
          <div className="flex-1 space-y-1">
            <Label htmlFor="notify_challan" className="text-sm font-medium text-text-primary block">
              Challan Updates
            </Label>
            <p className="text-xs text-text-muted">
              Receive notifications when challans are created, confirmed, or cancelled.
            </p>
          </div>
          <input
            type="checkbox"
            id="notify_challan" 
            checked={localSettings.notify_challan}
            onChange={() => handleToggle('notify_challan')}
            className="h-5 w-5 rounded border-border-default text-accent-primary focus:ring-accent-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between space-x-4 border-b border-border-subtle pb-6">
          <div className="flex-1 space-y-1">
            <Label htmlFor="notify_stock" className="text-sm font-medium text-text-primary block">
              Inventory & Stock Alerts
            </Label>
            <p className="text-xs text-text-muted">
              Receive alerts for low stock warnings and significant stock movements.
            </p>
          </div>
          <input
            type="checkbox"
            id="notify_stock" 
            checked={localSettings.notify_stock}
            onChange={() => handleToggle('notify_stock')}
            className="h-5 w-5 rounded border-border-default text-accent-primary focus:ring-accent-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between space-x-4 border-b border-border-subtle pb-6">
          <div className="flex-1 space-y-1">
            <Label htmlFor="notify_customer" className="text-sm font-medium text-text-primary block">
              Customer Follow-ups
            </Label>
            <p className="text-xs text-text-muted">
              Receive reminders for customer follow-ups and new customer activity.
            </p>
          </div>
          <input
            type="checkbox"
            id="notify_customer" 
            checked={localSettings.notify_customer}
            onChange={() => handleToggle('notify_customer')}
            className="h-5 w-5 rounded border-border-default text-accent-primary focus:ring-accent-primary cursor-pointer"
          />
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={updateSettings.isPending}
            className="w-full sm:w-auto"
          >
            {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
