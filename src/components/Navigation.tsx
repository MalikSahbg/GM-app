import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Truck,
  CreditCard,
  Wallet,
  Package,
  Building2,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  UserRound,
  X,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavigationProps {
  isOpen: boolean;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'new-sale', label: 'New Sale', icon: ShoppingCart },
  { id: 'sales-history', label: 'Sales History', icon: BarChart3 },
  { id: 'purchases', label: 'Purchases', icon: Truck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'udhaar', label: 'Udhaar', icon: Wallet },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
];

export const Navigation: React.FC<NavigationProps> = ({
  isOpen,
  currentTab,
  onSelectTab,
  onClose,
}) => {
  const { currentUser, logout, stats } = useApp();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex overflow-hidden ${isOpen ? '' : 'pointer-events-none'}`}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        className={`absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        id="app-navigation-drawer"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        aria-modal={isOpen}
        className={`relative z-10 flex h-full h-[100dvh] w-[min(20rem,88vw)] max-w-full shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-slate-200 bg-white pt-[env(safe-area-inset-top)] shadow-2xl transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="min-w-0">
            <p className="font-bold text-slate-900">Sales Manager</p>
            {currentUser && <p className="truncate text-xs text-slate-500">{currentUser.email}</p>}
          </div>
          <button type="button" onClick={onClose} tabIndex={isOpen ? 0 : -1} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 active:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              tabIndex={isOpen ? 0 : -1}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                currentTab === id
                  ? 'bg-emerald-600 text-white'
                  : id === 'orders'
                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">{label}</span>
              {id === 'orders' && (stats.pendingOrdersCount || 0) > 0 && (
                <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white">
                  {stats.pendingOrdersCount}
                </span>
              )}
              {id === 'udhaar' && stats.pendingUdhaarCustomers > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                  {stats.pendingUdhaarCustomers}
                </span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelect(currentUser ? 'account' : 'auth')}
            tabIndex={isOpen ? 0 : -1}
            className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${currentTab === 'account' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            <UserRound className="h-4 w-4 shrink-0" />
            <span>{currentUser ? 'Account / Profile' : 'Login / Account'}</span>
          </button>
        </nav>

        {currentUser && (
          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              tabIndex={isOpen ? 0 : -1}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
