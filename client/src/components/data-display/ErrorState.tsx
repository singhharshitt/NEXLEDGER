import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-danger-bg flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-danger" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {message && <p className="text-sm text-text-muted max-w-sm">{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-1" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}
