import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, ArrowRight, FileText, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Floating data cards for left panel
function FloatingCard({ icon: Icon, label, value, className }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn(
      'absolute bg-white/10 backdrop-blur-sm border border-white/10 rounded-[var(--radius-md)] px-4 py-3 text-white/90',
      'animate-float',
      className
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-accent-lime-bright" />
        <span className="text-[10px] uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || 'Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-dvh flex">
      {/* Left panel — dark with visual elements */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-dark relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Background pattern — topographic lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23A3E635' stroke-width='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-lime-bright/10 rounded-full blur-[120px]" />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent-lime-bright flex items-center justify-center">
              <span className="text-accent-primary font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">NexLedger</span>
          </div>

          <h2 className="text-display text-white mb-4 leading-tight">
            Connected operations.<br />
            <span className="text-accent-lime-bright">Smarter business.</span>
          </h2>
          <p className="text-lg text-white/60 mb-12">
            The modern ERP for wholesale and distribution.
          </p>

          {/* Floating cards */}
          <FloatingCard
            icon={FileText}
            label="Challan"
            value="CH-2026-000012"
            className="top-[15%] right-[8%]"
          />
          <FloatingCard
            icon={TrendingUp}
            label="Stock Movement"
            value="+500 units"
            className="bottom-[20%] left-[5%]"
          />
          <FloatingCard
            icon={Users}
            label="Customers"
            value="128 Active"
            className="bottom-[35%] right-[3%]"
          />
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg-primary lg:bg-bg-elevated">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent-primary flex items-center justify-center">
                <span className="text-text-inverse font-bold text-lg">N</span>
              </div>
              <span className="text-2xl font-bold text-text-primary tracking-tight">NexLedger</span>
            </div>
            <p className="text-sm text-text-muted">Connected operations. Smarter business.</p>
          </div>

          <div className="bg-bg-white rounded-[var(--radius-xl)] shadow-lg p-8 border border-border-subtle">
            <div className="mb-6">
              <h1 className="text-h3 text-text-primary">Welcome back</h1>
              <p className="text-body-sm text-text-muted mt-1">Sign in to your NexLedger account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger-bg border border-danger-border rounded-[var(--radius-md)] text-sm text-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@nexledger.in"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-muted text-center">
                Demo credentials: <span className="font-mono text-text-secondary">admin@nexledger.in</span> / <span className="font-mono text-text-secondary">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
