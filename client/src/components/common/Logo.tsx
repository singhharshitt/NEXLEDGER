import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'light' | 'dark';
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

const circleSizeClasses = {
  sm: 'h-10 w-10 p-2', // slightly larger than logo h-6
  md: 'h-12 w-12 p-2', // slightly larger than logo h-8
  lg: 'h-14 w-14 p-2', // slightly larger than logo h-10
  xl: 'h-16 w-16 p-2.5', // slightly larger than logo h-12
};

export function Logo({ variant = 'dark', size = 'md', showWordmark = true, className = '', isCollapsed = false, inverse = false }: LogoProps) {
  const imgElement = (
    <img
      src="/logo.png"
      alt="NexLedger"
      className={cn('w-auto object-contain shrink-0', variant === 'light' ? 'h-full w-full' : sizeClasses[size])}
    />
  );

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {variant === 'light' ? (
        <div className={cn('flex items-center justify-center rounded-full bg-[#0F1F0F] overflow-hidden shrink-0', circleSizeClasses[size])}>
          {imgElement}
        </div>
      ) : (
        imgElement
      )}
      
      {showWordmark && !isCollapsed && (
        <h1 className={cn("text-xl font-bold tracking-tight leading-none", inverse ? "text-white" : "text-text-primary")}>
          NexLedger
        </h1>
      )}
    </div>
  );
}
