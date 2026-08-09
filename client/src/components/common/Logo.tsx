import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  isCollapsed?: boolean;
  inverse?: boolean;
}

const sizeClasses = {
  sm: 'h-6', // ~24px
  md: 'h-8', // ~32px
  lg: 'h-10', // ~40px
  xl: 'h-12', // ~48px
};

export function Logo({ size = 'md', showWordmark = true, className = '', isCollapsed = false, inverse = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/logo.png"
        alt="NexLedger"
        className={cn('w-auto object-contain shrink-0', sizeClasses[size])}
      />
      {showWordmark && !isCollapsed && (
        <h1 className={cn("text-xl font-bold tracking-tight leading-none", inverse ? "text-white" : "text-text-primary")}>
          NexLedger
        </h1>
      )}
    </div>
  );
}
