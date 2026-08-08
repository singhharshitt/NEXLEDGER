import { Users, Package, AlertTriangle, FileText, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/data-display/StatCard';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useDashboardActivity, useStockChart, useRecentChallans, useLowStock } from '@/hooks/useDashboard';
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardActivity, Challan, Product } from '@/types';

// ── KPI Grid ──
function KPIGrid() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  if (isError) return <ErrorState message="Unable to load dashboard metrics." onRetry={() => refetch()} />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} loading={isLoading} />
      <StatCard label="Total Products" value={stats?.totalProducts ?? 0} icon={Package} loading={isLoading} />
      <StatCard label="Low Stock Items" value={stats?.lowStockItems ?? 0} icon={AlertTriangle} loading={isLoading} />
      <StatCard label="Draft Challans" value={stats?.draftChallans ?? 0} icon={FileText} loading={isLoading} />
    </div>
  );
}

// ── Recent Challans ──
function RecentChallansPanel() {
  const { data: challans, isLoading } = useRecentChallans();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Challans</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Recent Challans</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/challans')}>View all</Button>
      </CardHeader>
      <CardContent>
        {!challans?.length ? (
          <EmptyState title="No challans yet" description="Create your first sales challan to get started." />
        ) : (
          <div className="space-y-1">
            {challans.map((c: Challan) => (
              <button
                key={c.id}
                onClick={() => navigate(`/challans/${c.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-bg-elevated transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono font-medium text-text-primary">{c.challanNumber}</p>
                  <p className="text-xs text-text-muted truncate">{c.customerName}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono tabular-nums text-text-primary">{formatCurrency(c.totalAmount)}</span>
                  <StatusBadge status={c.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Low Stock Panel ──
function LowStockPanel() {
  const { data: products, isLoading } = useLowStock();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Low Stock Alerts</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Low Stock Alerts</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/stock')}>View all</Button>
      </CardHeader>
      <CardContent>
        {!products?.length ? (
          <EmptyState title="All stock levels healthy" description="No products are below minimum stock levels." />
        ) : (
          <div className="space-y-1">
            {products.map((p: Product) => (
              <button
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-bg-elevated transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-xs font-mono text-text-muted">{p.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono tabular-nums text-danger font-semibold">{p.currentStock} {p.unit}</p>
                  <p className="text-xs text-text-muted">Min: {p.minStock}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Stock Movement Chart ──
function StockMovementChart() {
  const { data: chartData, isLoading } = useStockChart();

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Stock Movement — Last 7 Days</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-64" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Stock Movement — Last 7 Days</CardTitle></CardHeader>
      <CardContent>
        {!chartData?.length ? (
          <EmptyState title="No movement data" description="Stock movements will appear here as they occur." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillInward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillOutward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE2" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(v: string) => formatDate(v, { day: '2-digit', month: 'short' })} tick={{ fontSize: 11, fill: '#8A9A8A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8A9A8A' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#142814',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                labelFormatter={(v: string) => formatDate(v)}
              />
              <Area type="monotone" dataKey="inward" name="Inward" stroke="#16A34A" fill="url(#fillInward)" strokeWidth={2} />
              <Area type="monotone" dataKey="outward" name="Outward" stroke="#F59E0B" fill="url(#fillOutward)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ── Activity Feed ──
const activityIcons: Record<string, React.ReactNode> = {
  challan_created: <FileText className="h-3.5 w-3.5" />,
  challan_confirmed: <ArrowUpRight className="h-3.5 w-3.5 text-success" />,
  stock_adjusted: <ArrowDownLeft className="h-3.5 w-3.5 text-info" />,
  customer_created: <Users className="h-3.5 w-3.5" />,
  product_created: <Package className="h-3.5 w-3.5" />,
  followup_added: <Clock className="h-3.5 w-3.5 text-warning" />,
};

function ActivityPanel() {
  const { data: activities, isLoading } = useDashboardActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <CardContent>
        {!activities?.length ? (
          <EmptyState title="No recent activity" />
        ) : (
          <div className="space-y-0">
            {activities.map((a: DashboardActivity) => (
              <div key={a.id} className="flex gap-3 py-2.5 border-b border-border-subtle last:border-0">
                <div className="h-7 w-7 rounded-full bg-bg-elevated flex items-center justify-center shrink-0 mt-0.5">
                  {activityIcons[a.type] || <Clock className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-snug">{a.description}</p>
                  <p className="text-xs text-text-muted mt-0.5">{a.user} · {timeAgo(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Dashboard Page ──
export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your business operations." />

      <div className="space-y-6">
        <KPIGrid />

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RecentChallansPanel />
          </div>
          <div className="lg:col-span-2">
            <LowStockPanel />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <StockMovementChart />
          </div>
          <div className="lg:col-span-2">
            <ActivityPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
