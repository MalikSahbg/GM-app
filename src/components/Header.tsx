import React from 'react';
import { Menu, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onSelectTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectTab, onOpenMenu }) => {
  const { currentUser, settings } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full max-w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="relative mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          aria-controls="app-navigation-drawer"
          className="flex h-10 w-10 shrink-0 items-center justify-center justify-self-start rounded-xl text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="flex min-w-0 max-w-[calc(100vw-10.375rem)] items-center justify-self-center gap-2 text-left sm:max-w-[min(58vw,18rem)]"
        >
          {settings.logoUrl ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-9 sm:w-9">
              <img src={settings.logoUrl} alt="" className="h-full w-full object-contain" />
            </span>
          ) : null}
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight text-slate-900 sm:text-lg">
              {settings.businessName || currentUser?.storeName || 'Sales Manager'}
            </span>
            <span className="hidden truncate text-[11px] font-medium text-slate-500 sm:block sm:text-xs">
              {settings.tagline || (currentUser ? currentUser.email : 'Retail & Wholesale Manager')}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab(currentUser ? 'account' : 'auth')}
          aria-label="Account"
          className="flex h-10 w-auto items-center justify-center justify-self-end gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:gap-2 sm:px-3 sm:text-sm"
        >
          <UserRound className="h-4 w-4" />
          <span>Account</span>
        </button>
      </div>
    </header>
  );
};
