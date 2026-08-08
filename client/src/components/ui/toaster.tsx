import { useToast } from '@/hooks/useToast';
import type { Toast } from '@/hooks/useToast';
import { X, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type ToastActionElement = ReactNode;

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  default: null,
};

const bgMap = {
  success: 'bg-accent-primary border-green-800',
  error: 'bg-red-900 border-red-700',
  warning: 'bg-amber-900 border-amber-700',
  default: 'bg-accent-primary border-green-800',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const type = t.type || 'default';
  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border px-4 py-3 shadow-lg text-white transition-all',
        bgMap[type],
        t.open ? 'animate-in slide-in-from-bottom-5 fade-in-0' : 'animate-out slide-out-to-right-full fade-out-0'
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden="true" />}
      <div className="flex-1 min-w-0">
        {t.title && <p className="text-sm font-semibold">{t.title}</p>}
        {t.description && <p className="text-sm opacity-90">{t.description}</p>}
      </div>
      {t.action}
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-[var(--radius-sm)] p-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
