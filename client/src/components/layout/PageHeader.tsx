import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}

export function PageHeader({ title, description, action, secondaryAction }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-h2 text-text-primary">{title}</h1>
        {description && (
          <p className="text-body-sm text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 shrink-0">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
}
