import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LucideIcon } from 'lucide-react';
import {
  Shield,
  TrendingUp,
  Warehouse as WarehouseIcon,
  Calculator,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  Mail,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthWireframe from '@/components/auth/AuthWireframe';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';
import { Logo } from '@/components/common/Logo';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const GRID_LINE = '#E2EFE2';

/* ── Role selector configuration ── */
type RoleTheme = 'lime' | 'pink';

const ROLE_CONFIG: { role: Role; label: string; icon: LucideIcon; theme: RoleTheme }[] = [
  { role: 'ADMIN', label: 'Admin', icon: Shield, theme: 'lime' },
  { role: 'SALES', label: 'Sales', icon: TrendingUp, theme: 'pink' },
  { role: 'WAREHOUSE', label: 'Warehouse', icon: WarehouseIcon, theme: 'lime' },
  { role: 'ACCOUNTS', label: 'Accounts', icon: Calculator, theme: 'pink' },
];

function roleLabel(role: Role): string {
  return ROLE_CONFIG.find((r) => r.role === role)?.label ?? role;
}


function RoleCard({
  option,
  selected,
  onSelect,
}: {
  option: { role: Role; label: string; icon: LucideIcon; theme: RoleTheme };
  selected: boolean;
  onSelect: (role: Role) => void;
}) {
  const lime = option.theme === 'lime';
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(option.role)}
      aria-pressed={selected}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[24px] border py-4 px-3 text-center transition-all duration-200',
        selected
          ? lime
            ? 'border-[#142814] bg-[#F7FEE7] ring-2 ring-[#142814]'
            : 'border-[#142814] bg-[#FDF2F8] ring-2 ring-[#142814]'
          : 'border-[#E2EFE2] bg-white hover:border-[#142814] hover:shadow-sm'
      )}
    >
      <Icon
        className={cn('h-5 w-5', selected ? (lime ? 'text-[#142814]' : 'text-[#142814]') : 'text-[#8A9A8A]')}
      />
      <span className={cn('text-sm font-medium', selected ? 'text-[#142814]' : 'text-[#5A6B5A]')}>
        {option.label}
      </span>
    </button>
  );
}

/* ── Development-only demo credentials (real seeded accounts) ── */
const DEMO_ACCOUNTS: { role: Role; email: string }[] = [
  { role: 'ADMIN', email: 'admin@nexledger.example.com' },
  { role: 'SALES', email: 'sales@nexledger.example.com' },
  { role: 'WAREHOUSE', email: 'warehouse@nexledger.example.com' },
  { role: 'ACCOUNTS', email: 'accounts@nexledger.example.com' },
];
const DEMO_PASSWORD = 'NexLedger@2026!';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    if (!selectedRole) {
      setError('Select your role to continue.');
      return;
    }
    try {
      setError(null);
      await login(data.email, data.password);

      const { user } = useAuthStore.getState();
      if (user && user.role !== selectedRole) {
        logout();
        setError(
          `This account is registered as ${roleLabel(user.role)}. Select that role to continue, or use the correct account for ${roleLabel(selectedRole)}.`
        );
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : '') ||
          'Unable to sign in. Please try again.'
      );
    }
  };

  const applyDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setSelectedRole(account.role);
    setValue('email', account.email);
    setValue('password', DEMO_PASSWORD);
    setError(null);
    setShowDemo(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#0F1F0F] lg:flex-row">
      {/* ══════════ LEFT PANEL — hero (55%) ══════════ */}
      <section className="relative flex h-64 w-full shrink-0 items-center justify-center overflow-hidden bg-[#0F1F0F] px-6 lg:h-auto lg:w-[55%] lg:px-14">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#A3E635]/10 blur-[120px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col">
          <div className="absolute left-6 top-6 lg:static lg:mb-2 lg:flex lg:justify-center">
            <Logo inverse size="xl" />
          </div>

          {/* 3D wireframe hero */}
          <div className="relative mt-2 flex h-28 w-28 items-center justify-center self-end opacity-90 lg:order-2 lg:mt-4 lg:h-[300px] lg:w-full lg:self-center lg:opacity-100">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <AuthWireframe className="h-full w-full" />
            </div>
          </div>

          <div className="lg:order-3 lg:text-center">
            <h1 className="font-display text-xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
              Connected operations.
              <br />
              Smarter business.
            </h1>
            <p className="mt-2 text-sm text-[#A3B8A3] lg:mt-4 lg:text-lg">
              The modern ERP for wholesale and distribution.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ RIGHT PANEL — authentication (45%) ══════════ */}
      <section
        className="relative flex w-full flex-1 items-center justify-center bg-[#F0F4F0] px-4 py-8 lg:w-[45%] lg:flex-none lg:shadow-[-10px_12px_40px_rgba(10,31,10,0.08)]"
      >
        {/* Blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.6,
          }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-[420px] rounded-[24px] border border-[#E2EFE2] bg-white p-6 shadow-[0_12px_40px_rgba(10,31,10,0.08)] md:p-8">
          {/* Mobile logo */}
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo size="xl" />
          </div>

          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold text-[#0A1F0A] tracking-tight">Welcome back</h2>
            <p className="mt-1 text-[15px] text-[#8A9A8A]">Sign in to your NexLedger account</p>
          </div>

          {/* Role selector — appears before the form */}
          <div className="mb-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#8A9A8A]">
              SELECT YOUR ROLE
            </p>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Select your role">
              {ROLE_CONFIG.map((opt) => (
                <RoleCard
                  key={opt.role}
                  option={opt}
                  selected={selectedRole === opt.role}
                  onSelect={setSelectedRole}
                />
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              key={error}
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.35 }}
              className="mb-6 rounded-[16px] border border-red-200 bg-red-50 py-2.5 px-4 text-[13px] font-medium text-red-600 flex items-center justify-center text-center"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {selectedRole ? (
              <motion.form
                key="login-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-5"
              >
                <style>{`
                  #email, #password {
                    padding-left: 2.75rem !important;
                    height: 3rem !important;
                  }
                  #password {
                    padding-right: 3rem !important;
                  }
                `}</style>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[#0A1F0A] font-semibold text-[13px]">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A9A8A]" aria-hidden="true" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      className={cn('rounded-full bg-[#F8FAF8]', errors.email && 'border-red-400 bg-red-50 focus-visible:ring-red-400')}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      aria-invalid={!!errors.email}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-xs text-red-600" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[#0A1F0A] font-semibold text-[13px]">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A9A8A]" aria-hidden="true" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={cn('rounded-full bg-[#F8FAF8]', errors.password && 'border-red-400 bg-red-50 focus-visible:ring-red-400')}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      aria-invalid={!!errors.password}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A9A8A] transition-colors hover:text-[#0A1F0A]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-xs text-red-600" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-full bg-[#142814] text-[15px] font-semibold text-white transition-colors hover:bg-[#1a2e1a] shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2"
                >
                  {isSubmitting ? (
                     <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign in as {roleLabel(selectedRole)}
                      <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="w-full text-center text-[13px] font-medium text-[#8A9A8A] transition-colors hover:text-[#5A6B5A]"
                >
                  Switch role
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="role-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="rounded-[16px] border border-dashed border-[#D4E4D4] bg-[#F8FAF8] p-5 text-center"
              >
                <p className="text-[13px] text-[#5A6B5A]">
                  Select your role to enter the credentials for that role.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {import.meta.env.DEV && (
            <div className="mt-6 border-t border-[#E2EFE2] pt-4">
              <button
                type="button"
                onClick={() => setShowDemo((s) => !s)}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[#8A9A8A] transition-colors hover:text-[#5A6B5A]"
                aria-expanded={showDemo}
              >
                Demo credentials
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showDemo && 'rotate-180')} />
              </button>

              {showDemo && (
                <div className="mt-3 space-y-1.5">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => applyDemo(account)}
                      className="flex w-full items-center justify-between rounded-lg border border-[#E2EFE2] bg-[#F8FAF8] px-3 py-2 text-left transition-colors hover:border-[#142814]"
                    >
                      <span className="text-xs font-semibold text-[#5A6B5A]">{account.role}</span>
                      <span className="font-mono text-[11px] text-[#8A9A8A]">{account.email}</span>
                    </button>
                  ))}
                  <p className="font-mono text-[11px] text-[#8A9A8A] pt-1">Password: {DEMO_PASSWORD}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}