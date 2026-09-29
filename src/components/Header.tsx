import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  LogOut,
  AlertTriangle,
  User as UserIcon,
  MessageSquare,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, logout, stats, settings } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Store Name */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0"
            onClick={() => onSelectTab('dashboard')}
          >
            {settings.logoUrl ? (
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
                <Store className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                  {settings.businessName || currentUser?.storeName || 'Sales Manager'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  Pro
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                {settings.tagline || (currentUser ? currentUser.email : 'Retail & Wholesale Manager')}
              </p>
            </div>
          </div>

          {/* Center alerts & fast stats (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3">
            {stats.lowStockCount > 0 && (
              <button
                onClick={() => onSelectTab('stock')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                title={`${stats.lowStockCount} products are low in stock`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>{stats.lowStockCount} Low Stock</span>
              </button>
            )}

            {stats.pendingUdhaarCustomers > 0 && (
              <button
                onClick={() => onSelectTab('udhaar')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 rounded-full hover:bg-rose-100 transition-colors"
                title={`${stats.pendingUdhaarCustomers} customers have pending balance`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{stats.pendingUdhaarCustomers} Udhaar Debtors</span>
              </button>
            )}
          </div>

          {/* Right Actions & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* WhatsApp Quick Trigger */}
            <button
              onClick={() => onSelectTab('whatsapp')}
              title="WhatsApp Reminders & Messages"
              className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Settings Quick Tab */}
            <button
              onClick={() => onSelectTab('settings')}
              title="Settings & Branding"
              className={`p-2 rounded-xl transition-colors ${
                currentTab === 'settings'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="h-4 w-4" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                <div
                  title={currentUser.email}
                  className="h-8 w-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0"
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left max-w-[120px]">
                  <p className="text-xs font-semibold text-slate-900 leading-none truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectTab('auth')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
