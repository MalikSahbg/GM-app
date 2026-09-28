import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, User, Lock, Mail, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'SIGNUP') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      signup(name.trim(), email.trim(), password, storeName.trim() || 'My Retail Store');
    } else {
      login(email.trim(), password);
    }

    onClose();
  };

  const handleDemoFill = () => {
    setEmail('malik@salesapp.com');
    setPassword('demo123');
    setName('Malik Ahmed');
    setStoreName('Malik General & Wholesale Store');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'LOGIN' ? 'Store Owner Login' : 'Create Store Account'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1 mt-4">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'LOGIN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('SIGNUP');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'SIGNUP' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}

          {mode === 'SIGNUP' && (
            <>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Malik Ahmed"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
                  Store / Business Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Ahmed General & Wholesale Store"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-600 block mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Fill Demo Credentials
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              {mode === 'LOGIN' ? 'Sign In to Store' : 'Create & Launch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
