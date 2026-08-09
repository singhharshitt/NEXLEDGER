import { NavLink, useLocation } from 'react-router-dom';
import type { ComponentType } from 'react';
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
import { Logo } from '@/components/common/Logo';

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
}

interface NavContentProps {
  filteredMain: NavItem[];
  filteredBottom: NavItem[];
  sidebarCollapsed: boolean;
  currentPath: string;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { label: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { label: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE'] },
  { label: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['ADMIN', 'WAREHOUSE'] },
  { label: 'Challans', path: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
];

function NavContent({
  filteredMain,
  filteredBottom,
  sidebarCollapsed,
  currentPath,
  setSidebarOpen,
  setSidebarCollapsed,
}: NavContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-border-subtle shrink-0',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <Logo variant="light" size="md" isCollapsed={sidebarCollapsed} showWordmark={false} />
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <div>
              <h1 className="text-base font-bold text-text-primary tracking-tight leading-none">NexLedger</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">Operations</p>
            </div>
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
                <item.icon
                  className={cn('h-[18px] w-[18px] shrink-0', currentPath.startsWith(item.path) && 'text-accent-primary')}
                  aria-hidden="true"
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

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
}

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const userRole = user?.role || 'ADMIN';

  const filteredMain = mainNavItems.filter((item) => item.roles.includes(userRole));
  const filteredBottom = bottomNavItems.filter((item) => item.roles.includes(userRole));
  const navContentProps = {
    filteredMain,
    filteredBottom,
    sidebarCollapsed,
    setSidebarOpen,
    setSidebarCollapsed,
    currentPath: location.pathname,
  };

  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed top-0 left-0 h-full bg-bg-white border-r border-border-subtle z-40 transition-all duration-300',
          sidebarCollapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
        )}
      >
        <NavContent {...navContentProps} />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-bg-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

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
        <NavContent {...navContentProps} />
      </aside>
    </>
  );
}
