'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ show, onClose, mode, setMode, form, onChange, onSubmit, error }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>
 
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access secure multi-user features
          </p>
        </div>
 
        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-805 rounded-xl text-rose-350 text-xs">
            {error}
          </div>
        )}
 
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Organization Details</span>
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1">Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={form.orgName || ''}
                    onChange={(e) => onChange({ ...form, orgName: e.target.value })}
                    className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Admin Credentials</span>
                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Mercer"
                    value={form.name || ''}
                    onChange={(e) => onChange({ ...form, name: e.target.value })}
                    className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>
            </>
          )}
 
          <div>
            <label className="block text-xs text-zinc-300 font-semibold mb-1">Username</label>
            <input
              type="text"
              placeholder="e.g. alex_dev"
              value={form.username || ''}
              onChange={(e) => onChange({ ...form, username: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
 
          <div>
            <label className="block text-xs text-zinc-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password || ''}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>


          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-orange-600/20"
          >
            {mode === 'login' ? 'Login to Dashboard' : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <span className="text-zinc-400">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>{' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              onChange({ username: '', password: '', name: '', orgName: '' });
            }}
            className="text-orange-400 hover:underline font-semibold"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
