import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  Settings,
  X,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { label: 'Customers', path: '/customers', icon: Users, roles: ['admin', 'sales', 'accounts'] },
  { label: 'Products', path: '/products', icon: Package, roles: ['admin', 'sales', 'warehouse'] },
  { label: 'Inventory', path: '/stock', icon: Warehouse, roles: ['admin', 'warehouse'] },
  { label: 'Challans', path: '/challans', icon: FileText, roles: ['admin', 'sales', 'accounts'] },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const userRole = user?.role || 'admin';

  const filteredMain = mainNavItems.filter((item) => item.roles.includes(userRole));
  const filteredBottom = bottomNavItems.filter((item) => item.roles.includes(userRole));

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border-subtle shrink-0',
        sidebarCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent-primary flex items-center justify-center shrink-0">
          <span className="text-text-inverse font-bold text-sm">N</span>
        </div>
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <div>
              <h1 className="text-base font-bold text-text-primary tracking-tight leading-none">NexLedger</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">Operations</p>
            </div>
            {/* Collapse button — desktop only */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute -right-3 top-5 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-bg-white border border-border-default shadow-sm text-text-muted hover:text-text-primary transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className={cn(!sidebarCollapsed && 'mb-2 px-3')}>
          {!sidebarCollapsed && <span className="text-metadata">Main</span>}
        </div>
        <ul className="space-y-1">
          {filteredMain.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-[var(--radius-md)] transition-all duration-200 text-sm font-medium',
                    sidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-bg-elevated text-text-primary border-l-[3px] border-accent-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-muted'
                  )
                }
              >
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', location.pathname.startsWith(item.path) && 'text-accent-primary')} aria-hidden="true" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom nav */}
      {filteredBottom.length > 0 && (
        <div className="border-t border-border-subtle px-3 py-4">
          <ul className="space-y-1">
            {filteredBottom.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-[var(--radius-md)] transition-all duration-200 text-sm font-medium',
                      sidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                      isActive
                        ? 'bg-bg-elevated text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-muted'
                    )
                  }
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed top-0 left-0 h-full bg-bg-white border-r border-border-subtle z-40 transition-all duration-300 relative',
          sidebarCollapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-bg-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-[280px] bg-bg-white border-r border-border-subtle z-50 transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary transition-colors"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
        <NavContent />
      </aside>
    </>
  );
}
