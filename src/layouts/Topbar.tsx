import React from 'react';
import { Search, Bell, User, Cloud, CloudOff } from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';

export default function Topbar() {
  const { user } = useAuthStore();
  const isOnline = true; // Placeholder for online status check

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products, invoices (Alt+S)"
            className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium">
          {isOnline ? (
            <>
              <Cloud size={14} className="text-primary" />
              <span className="text-text-secondary">Synced</span>
            </>
          ) : (
            <>
              <CloudOff size={14} className="text-destructive" />
              <span className="text-text-secondary">Offline</span>
            </>
          )}
        </div>

        <button
          type="button"
          className="relative text-text-secondary hover:text-primary transition-all"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full border-2 border-surface" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text-primary">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-text-secondary capitalize">
              {user?.role || 'Guest'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
