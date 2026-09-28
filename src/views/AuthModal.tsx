import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, User, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      signup(name, email, password, storeName);
    } else {
      login(email, password);
    }
    onClose();
  };

  const handleDemoLogin = () => {
    login('malik@salesapp.com', 'password123');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-900 p-6 text-white text-center">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sales Manager</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            {isSignUp ? 'Create your store account' : 'Sign in to manage sales & Udhaar'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              !isSignUp
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/40'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              isSignUp
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/40'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malik Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Store / Business Name
                </label>
                <div className="relative">
                  <Store className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed General Store"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. owner@store.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>{isSignUp ? 'Create Store Account' : 'Sign In to Store'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              ⚡ Quick Demo Sign In (Malik Ahmed)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
