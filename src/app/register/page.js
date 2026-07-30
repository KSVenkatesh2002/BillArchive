'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { CONFIG } from '@/lib/config';
import { Eye, EyeOff, Mail } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', orgName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiClient.register(form.name, form.email, form.password, form.orgName);

      if (data.success) {
        router.push(`/${data.user.orgId}/${data.user.id}`);
        router.refresh();
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg mb-4 mx-auto">
            {CONFIG.SITE_INITIAL}
          </Link>
          <h2 className="text-xl font-black text-white">Create Organization</h2>
          <p className="text-xs text-zinc-400 mt-1">Set up a new organization and admin account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-3">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Organization Details</span>
            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
                required
                autoComplete="off"
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black border border-zinc-805 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
                required
                autoComplete="off"
              />
            </div>

            <div>

              <label className="block text-xs text-zinc-300 font-semibold mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-black border border-zinc-805 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-orange-500"
                  required
                  autoComplete="new-password"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-orange-600/20 disabled:opacity-55"
          >
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <span className="text-zinc-400">Already have an account?</span>{' '}
          <Link href="/login" className="text-orange-400 hover:underline font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
