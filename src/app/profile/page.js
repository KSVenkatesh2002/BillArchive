'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { CONFIG } from '@/lib/config';
import {
  User,
  Mail,
  Briefcase,
  Phone,
  BookOpen,
  Key,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
];

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    phone: '',
    clickUpToken: '',
    avatarUrl: ''
  });

  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const auth = await apiClient.checkAuth();
        if (auth.authenticated && auth.user) {
          setCurrentUser(auth.user);
          setForm({
            name: auth.user.name || '',
            email: auth.user.email || '',
            title: auth.user.title || '',
            bio: auth.user.bio || '',
            phone: auth.user.phone || '',
            clickUpToken: auth.user.clickUpToken || '',
            avatarUrl: auth.user.avatarUrl || AVATAR_PRESETS[0]
          });
        } else {
          router.push('/login');
        }
      } catch (err) {
        setError('Authentication check failed.');
      } finally {
        setLoadingAuth(false);
      }
    }
    init();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiClient.updateProfile(form);
      if (res.success) {
        setSuccess('Profile updated successfully!');
        setCurrentUser(res.user);
        router.refresh();
      } else {
        setError(res.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');

    try {
      const res = await apiClient.deleteAccount();
      if (res.success) {
        // Redirect to homepage which will show logged out view
        router.push('/');
        router.refresh();
      } else {
        setError(res.error || 'Failed to delete account.');
        setShowDeleteModal(false);
        setDeleting(false);
      }
    } catch (err) {
      setError('An error occurred during account deletion.');
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="text-sm font-semibold">Loading Profile Context...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/80">
          <Link
            href={currentUser ? `/${currentUser.username}` : "/"}
            className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 flex items-center justify-center transition-colors"
            title="Return to main dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Account Profile</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Customize your personal bio, settings, and team integrations</p>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="p-4 bg-emerald-950/25 border border-emerald-900/35 rounded-2xl text-emerald-350 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-950/25 border border-rose-900/35 rounded-2xl text-rose-350 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-450 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Avatar / Quick Overview */}
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 flex flex-col items-center text-center space-y-6 h-fit">
            <div className="relative group">
              {/* Avatar circle */}
              <img
                src={form.avatarUrl || AVATAR_PRESETS[0]}
                alt="Profile Avatar"
                className="w-28 h-28 rounded-full border-2 border-orange-500/50 object-cover shadow-xl"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change below</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black text-white">{currentUser?.name || form.name}</h2>
              <p className="text-xs text-orange-400 font-mono mt-0.5">@{currentUser?.username}</p>
              {form.title && (
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 mt-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {form.title}
                </span>
              )}
            </div>

            {/* Avatar Preset Selector */}
            <div className="w-full space-y-2 border-t border-zinc-800 pt-4">
              <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block text-left">Choose Profile Avatar</span>
              <div className="flex justify-center gap-3">
                {AVATAR_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setForm({ ...form, avatarUrl: preset })}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                      form.avatarUrl === preset ? 'border-orange-500 scale-105 shadow-md shadow-orange-650/20' : 'border-transparent hover:border-zinc-700'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Profile Editor Form */}
          <div className="lg:col-span-2 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-800">
              Personal Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="Alex Mercer"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Title / Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="e.g. Lead Software Engineer"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Bio / Profile Description</label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
                  <textarea
                    placeholder="Brief details about yourself..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 mt-6">
                <label className="block text-xs font-semibold text-zinc-400 mb-1">ClickUp Personal API Token</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="pk_xxxx_xxxxxxxxxxxxxx"
                    value={form.clickUpToken}
                    onChange={(e) => setForm({ ...form, clickUpToken: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-750 focus:outline-none focus:border-orange-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-550 hover:text-zinc-300 transition-colors"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Used to query task linking status from ClickUp API directly.</p>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Save profile */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
                </button>

                {/* Soft Delete Account button trigger */}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full sm:w-auto bg-transparent hover:bg-rose-950/20 text-rose-450 hover:text-rose-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition border border-rose-900/30 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-6">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete Your Account?</h3>
                <p className="text-xs text-zinc-450 mt-1 leading-relaxed">
                  This action performs a **soft-delete** on your account. You will be logged out instantly and will no longer be able to log in or access your tasks. Your account record will remain in our archive.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs py-3 rounded-xl transition border border-zinc-800"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1"
                disabled={deleting}
              >
                {deleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
