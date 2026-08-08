import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

export function AppShell() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex min-h-dvh bg-bg-primary">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-h-dvh transition-all duration-300',
          'lg:ml-[var(--sidebar-width)]',
          sidebarCollapsed && 'lg:ml-[var(--sidebar-collapsed)]'
        )}
      >
        <TopNav />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
