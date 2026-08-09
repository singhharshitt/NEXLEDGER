import { Menu, Search, LogOut } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';

export function TopNav() {
  const { user, logout } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-bg-white border-b border-border-subtle flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search customers, products, challans..."
            className="pl-9 bg-bg-primary border-transparent focus-visible:border-border-default focus-visible:bg-bg-white h-9"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-[var(--radius-md)] hover:bg-bg-elevated transition-colors"
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center">
              <span className="text-xs font-semibold text-text-inverse">
                {user ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-text-primary leading-none">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted capitalize mt-0.5">{user?.role || 'ADMIN'}</p>
            </div>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-bg-white border border-border-subtle rounded-[var(--radius-md)] shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-border-subtle sm:hidden">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-muted capitalize">{user?.role}</p>
              </div>
              <div className="px-3 py-2 border-b border-border-subtle">
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg transition-colors"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
