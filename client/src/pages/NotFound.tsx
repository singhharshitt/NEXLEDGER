import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-primary p-4">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="h-8 w-8 text-text-muted" aria-hidden="true" />
        </div>
        <h1 className="text-display text-text-primary mb-2">404</h1>
        <p className="text-h4 text-text-secondary mb-2">Page not found</p>
        <p className="text-body text-text-muted mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
