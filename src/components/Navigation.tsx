import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Truck,
  CreditCard,
  Wallet,
  Boxes,
  Package,
  Building2,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const { stats } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      highlight: true,
      badge: stats.pendingOrdersCount && stats.pendingOrdersCount > 0 ? stats.pendingOrdersCount : undefined,
      badgeColor: 'bg-emerald-600',
    },
    { id: 'new-sale', label: 'New Sale', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchases', icon: Truck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    {
      id: 'udhaar',
      label: 'Udhaar (Receivable)',
      icon: Wallet,
      badge: stats.pendingUdhaarCustomers > 0 ? stats.pendingUdhaarCustomers : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: Boxes,
      badge: stats.lowStockCount > 0 ? stats.lowStockCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports & P&L', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : item.highlight
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-extrabold text-white px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
