import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  LogOut,
  AlertTriangle,
  RotateCcw,
  User as UserIcon,
  MessageSquare,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, logout, stats, resetDemoData, settings } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Store Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            {settings.logoUrl ? (
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs">
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                <Store className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  {settings.businessName || 'Sales Manager'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {settings.tagline || currentUser?.storeName || 'Retail & Wholesale Manager'}
              </p>
            </div>
          </div>

          {/* Center alerts & fast stats */}
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* WhatsApp Quick Trigger */}
            <button
              onClick={() => onSelectTab('whatsapp')}
              title="WhatsApp Reminders & Messages"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
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

            {/* Reset Demo Data */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data to fresh initial state?')) {
                  resetDemoData();
                }
              }}
              title="Reset Demo Data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-none">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{currentUser.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectTab('auth')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
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
