import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../shared/utils';
import { useAuthStore } from '../stores/auth-store';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'POS', path: '/pos' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const { logout } = useAuthStore();

  return (
    <aside className="w-64 bg-secondary flex flex-col h-full border-r border-border shadow-soft">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <ShoppingCart className="text-primary-foreground" size={24} />
        </div>
        <span className="text-xl font-bold text-secondary-foreground">
          POS System
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-md text-secondary-foreground/70 hover:bg-primary/10 hover:text-primary transition-all',
              item.path === window.location.pathname &&
                'bg-primary/10 text-primary',
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-secondary-foreground/10">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
