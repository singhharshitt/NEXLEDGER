import { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Users, Package, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/data-display/StatCard';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardStats, useDashboardActivity, useStockChart, useRecentChallans, useLowStock } from '@/hooks/useDashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import type { DashboardActivity, Challan, Product } from '@/types';

const LOW_STOCK_ROLES = ['ADMIN', 'WAREHOUSE'];
const RECENT_CHALLANS_ROLES = ['ADMIN', 'SALES', 'ACCOUNTS'];

const skeletonBarHeights = [35, 62, 48, 74, 54, 68, 42];

// ── Helpers ──
const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('en-IN', { month: 'short' })}`;
};

const formatDateFull = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ── Skeletons ──
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] p-6 animate-pulse">
      <div className="w-10 h-10 bg-[#E8F0E8] rounded-lg" />
      <div className="mt-4 h-8 w-24 bg-[#E8F0E8] rounded" />
      <div className="mt-2 h-3 w-20 bg-[#E8F0E8] rounded" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 px-4 grid grid-cols-[1.5fr_1fr_100px_100px_80px] items-center gap-4 border-b border-[#E2EFE2] animate-pulse">
          <div className="h-3 bg-[#E8F0E8] rounded w-24" />
          <div className="h-3 bg-[#E8F0E8] rounded w-32" />
          <div className="h-3 bg-[#E8F0E8] rounded w-16" />
          <div className="h-3 bg-[#E8F0E8] rounded w-20 justify-self-end" />
          <div className="h-5 bg-[#E8F0E8] rounded-full w-16 justify-self-end" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2EFE2] p-6 h-[280px] animate-pulse flex items-end justify-around">
      {skeletonBarHeights.map((height, i) => (
        <div key={i} className="w-8 bg-[#E8F0E8] rounded-t" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

// ── KPI Grid ──
function KPIGrid() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-between">
        <p className="text-sm font-medium">Unable to load dashboard metrics.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {isLoading ? (
        <>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </>
      ) : (
        <>
          <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} />
          <StatCard label="Total Products" value={stats?.totalProducts ?? 0} icon={Package} />
          <StatCard label="Low Stock Items" value={stats?.lowStockItems ?? 0} icon={AlertTriangle} />
          <StatCard label="Draft Challans" value={stats?.draftChallans ?? 0} icon={FileText} />
        </>
      )}
    </div>
  );
}

// ── Recent Challans ──
function RecentChallansPanel({ enabled = true }: { enabled?: boolean }) {
  const { data: challans, isLoading, isError, refetch } = useRecentChallans(enabled);
  const navigate = useNavigate();

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Challans</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-red-600 mb-2">Unable to load recent challans.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-[#E2EFE2] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-sans font-semibold text-[#0A1F0A]">Recent Challans</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/challans')} className="text-sm text-[#5A6B5A] hover:text-[#0A1F0A]">View all</Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <TableRowSkeleton />
        ) : !challans?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-[#8A9A8A] mb-3" />
            <p className="text-sm font-medium text-[#0A1F0A]">No recent challans</p>
            <p className="text-xs text-[#8A9A8A] mt-1">Create a new challan to see it here</p>
            <Button variant="outline" className="mt-4 h-9 text-xs rounded-lg" onClick={() => navigate('/challans/new')}>
              New Challan
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {challans.map((c: Challan) => (
              <div
                key={c.id}
                onClick={() => navigate(`/challans/${c.id}`)}
                className="group grid grid-cols-[1.5fr_1fr_100px_100px_80px] items-center gap-4 px-4 h-12 transition-colors duration-150 hover:bg-[#E8F0E8]/50 cursor-pointer border-b border-[#E2EFE2] last:border-0"
              >
                <span className="font-mono text-sm text-[#0A1F0A] tracking-tight truncate">
                  {c.challanNumber}
                </span>
                <span className="text-sm text-[#5A6B5A] truncate">
                  {c.customerName}
                </span>
                <span className="font-mono text-xs text-[#8A9A8A] tabular-nums">
                  {formatShortDate(c.createdAt)}
                </span>
                <span className="font-mono text-sm font-medium text-[#0A1F0A] text-right tabular-nums">
                  ₹{c.totalAmount.toLocaleString('en-IN')}
                </span>
                <div className="justify-self-end">
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Low Stock Panel ──
const LowStockRow = ({ item }: { item: Product }) => {
  const ratio = useMemo(() => {
    if (item.minStock <= 0) return item.currentStock > 0 ? 100 : 0;
    const pct = (item.currentStock / item.minStock) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }, [item.currentStock, item.minStock]);

  const isOutOfStock = item.currentStock === 0;

  return (
    <div className="py-3 px-4 border-b border-[#E2EFE2] last:border-0 hover:bg-[#FDF2F8]/30 transition-colors cursor-pointer">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#0A1F0A] truncate pr-4">
          {item.name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            "font-mono text-sm font-medium tabular-nums",
            isOutOfStock ? "text-[#F43F5E]" : "text-[#F59E0B]"
          )}>
            {item.currentStock}
          </span>
          <span className="font-mono text-xs text-[#8A9A8A] tabular-nums">
            / {item.minStock}
          </span>
        </div>
      </div>
      
      {/* Progress Track */}
      <div className="h-1.5 w-full rounded-full bg-[#E2EFE2] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ratio}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "h-full rounded-full",
            isOutOfStock ? "bg-[#F43F5E]" : "bg-[#F59E0B]"
          )}
        />
      </div>
      
      {isOutOfStock && (
        <p className="text-[10px] uppercase tracking-wider text-[#F43F5E] font-medium mt-1">
          Out of Stock
        </p>
      )}
    </div>
  );
};

function LowStockPanel({ enabled = true }: { enabled?: boolean }) {
  const { data: products, isLoading, isError, refetch } = useLowStock(enabled);
  const navigate = useNavigate();

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-[#F43F5E] flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Low Stock Alerts</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-red-600 mb-2">Unable to load low stock data.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-[#E2EFE2] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-sans font-semibold text-[#F43F5E] flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')} className="text-sm text-[#5A6B5A] hover:text-[#0A1F0A]">View all</Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-[#E2EFE2] animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-32 bg-[#E8F0E8] rounded" />
                  <div className="h-4 w-12 bg-[#E8F0E8] rounded" />
                </div>
                <div className="h-1.5 w-full bg-[#E8F0E8] rounded-full" />
              </div>
            ))}
          </div>
        ) : !products?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#16A34A] mb-3" />
            <p className="text-sm font-medium text-[#0A1F0A]">All stock healthy</p>
            <p className="text-xs text-[#8A9A8A] mt-1">No items below minimum threshold</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {products.map((p: Product) => (
              <div key={p.id} onClick={() => navigate(`/products/${p.id}`)}>
                <LowStockRow item={p} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type StockTooltipPayload = {
  dataKey?: string | number;
  color?: string;
  value?: string | number;
};

type StockTooltipProps = {
  active?: boolean;
  payload?: StockTooltipPayload[];
  label?: string;
};

// ── Stock Movement Chart ──
const CustomTooltip = ({ active, payload, label }: StockTooltipProps) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-[#0F1F0F] text-white rounded-lg px-3 py-2.5 shadow-lg border border-[#1a2e1a]">
      <p className="font-mono text-[11px] text-[#8A9A8A] mb-1.5">
        {label ? formatDateFull(label) : ''}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs font-mono">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }} 
          />
          <span className="capitalize text-[#A3B8A3]">{entry.dataKey}:</span>
          <span className="text-white font-medium tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

function StockMovementChart() {
  const { data: chartData, isLoading, isError, refetch } = useStockChart();

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Stock Movement (7 Days)</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-red-600 mb-2">Unable to load stock movement.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-[#E2EFE2] shadow-sm h-full">
      <CardHeader>
        <CardTitle className="font-sans font-semibold text-[#0A1F0A]">Stock Movement (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : !chartData?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-[280px]">
            <p className="text-sm font-medium text-[#0A1F0A]">No stock movement data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A3E635" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#A3E635" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F472B6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F472B6" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE2" vertical={false} />
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#8A9A8A' }}
                tickLine={false}
                axisLine={{ stroke: '#E2EFE2' }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('en-IN', { month: 'short' })}`;
                }}
              />
              
              <YAxis 
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#8A9A8A' }}
                tickLine={false}
                axisLine={false}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="inward"
                name="Inward"
                stroke="#A3E635"
                strokeWidth={2}
                fill="url(#colorInward)"
                dot={{ r: 3, fill: '#A3E635', strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: '#A3E635', strokeWidth: 2, fill: '#fff' }}
              />
              
              <Area
                type="monotone"
                dataKey="outward"
                name="Outward"
                stroke="#F472B6"
                strokeWidth={2}
                fill="url(#colorOutward)"
                dot={{ r: 3, fill: '#F472B6', strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: '#F472B6', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ── Activity Feed ──
function ActivityPanel() {
  const { data: activities, isLoading, isError, refetch } = useDashboardActivity();

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-red-600 mb-2">Unable to load recent activity.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-[#E2EFE2] shadow-sm h-full">
      <CardHeader>
        <CardTitle className="font-sans font-semibold text-[#0A1F0A]">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#E8F0E8] animate-pulse mt-1 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-[#E8F0E8] rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#E8F0E8] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : !activities?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-[#0A1F0A]">No recent activity</p>
          </div>
        ) : (
          <div className="relative pl-3">
            {/* Vertical connecting line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#E2EFE2]" />
            
            <div className="space-y-6">
              {activities.map((activity: DashboardActivity, index: number) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative"
                >
                  {/* Color-coded dot */}
                  <span className={cn(
                    "absolute -left-[7px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white",
                    activity.type.includes('customer') && "bg-blue-400",
                    activity.type.includes('product') && "bg-blue-400",
                    activity.type.includes('challan') && "bg-[#A3E635]",
                    activity.type.includes('stock') && "bg-[#F472B6]",
                    activity.type.includes('followup') && "bg-purple-400"
                  )} />
                  
                  {/* Content */}
                  <div className="ml-5">
                    <p className="text-sm text-[#0A1F0A] leading-snug">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[11px] text-[#8A9A8A] tabular-nums">
                        {formatTime(activity.timestamp)}
                      </span>
                      <span className="text-[#D4E4D4]">•</span>
                      <span className="text-[11px] text-[#8A9A8A]">
                        {activity.user}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ── Dashboard Page ──
export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role as string | undefined;
  const canViewRecentChallans = !!role && RECENT_CHALLANS_ROLES.includes(role);
  const canViewLowStock = !!role && LOW_STOCK_ROLES.includes(role);

  const today = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-[1400px] mx-auto w-full">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your business operations." 
        secondaryAction={
          <span className="font-mono text-xs text-[#8A9A8A] tabular-nums">
            {today}
          </span>
        }
      />

      <div className="space-y-6">
        <KPIGrid />

        {/* Middle row */}
        {(canViewRecentChallans || canViewLowStock) && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 mt-6">
            {canViewRecentChallans && (
              <div className={`${canViewLowStock ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
                <RecentChallansPanel enabled={canViewRecentChallans} />
              </div>
            )}
            {canViewLowStock && (
              <div className={`${canViewRecentChallans ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
                <LowStockPanel enabled={canViewLowStock} />
              </div>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6">
          <div className="flex flex-col">
            <StockMovementChart />
          </div>
          <div className="flex flex-col">
            <ActivityPanel />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
