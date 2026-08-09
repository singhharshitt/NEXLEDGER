import { Component, lazy, Suspense, type ReactNode } from 'react';

const WireframeScene = lazy(() => import('./WireframeScene'));

interface StaticFallbackProps {
  className?: string;
}

function StaticFallback({ className }: StaticFallbackProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
        <g stroke="#A3E635" strokeWidth="1" opacity="0.85">
          <ellipse cx="100" cy="100" rx="86" ry="34" />
          <ellipse cx="100" cy="100" rx="74" ry="20" transform="rotate(60 100 100)" />
          <circle cx="100" cy="100" r="12" />
        </g>
        <g stroke="#F472B6" strokeWidth="1" opacity="0.45">
          <circle cx="100" cy="100" r="60" strokeDasharray="2 7" />
          <ellipse cx="100" cy="100" rx="92" ry="48" transform="rotate(-30 100 100)" strokeDasharray="1 6" />
        </g>
      </svg>
    </div>
  );
}

interface WireframeBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

class WireframeBoundary extends Component<WireframeBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface AuthWireframeProps {
  className?: string;
}

// Decorative 3D hero. Lazy-loaded and isolated behind an error boundary so a
// WebGL failure can never break the authentication form.
export default function AuthWireframe({ className }: AuthWireframeProps) {
  return (
    <WireframeBoundary fallback={<StaticFallback className={className} />}>
      <Suspense fallback={<StaticFallback className={className} />}>
        <WireframeScene />
      </Suspense>
    </WireframeBoundary>
  );
}