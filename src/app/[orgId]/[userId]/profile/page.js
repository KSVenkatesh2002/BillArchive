'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { CONFIG } from '@/lib/config';
import { LogOut } from 'lucide-react';

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
  Trash2,
  Settings,
  Plus,
  Trash,
  ChevronDown
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
];

export default function ProfilePage() {
  const { userId, orgId } = useParams();
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

  // Organization config & User Preferences overrides state
  const [orgName, setOrgName] = useState('');
  const [orgDbId, setOrgDbId] = useState('');
  const [dynamicFields, setDynamicFields] = useState([]);
  const [userPrefs, setUserPrefs] = useState({});
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);

  // Organization users state
  const [orgUsers, setOrgUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', username: '', password: '', role: 'user' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [userFormError, setUserFormError] = useState('');

  const router = useRouter();

  const fetchOrgUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await apiClient.getOrganizationUsers();
      if (res.success) {
        setOrgUsers(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const auth = await apiClient.checkAuth();
        if (auth.authenticated && auth.user) {
          if (auth.user.userId !== userId || auth.user.orgId !== orgId) {
            router.push(`/${auth.user.orgId || 'dialedin'}/${auth.user.userId}/profile`);
            return;
          }
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

          const orgRes = await fetch('/api/organization/config').then((res) => res.json());
          if (orgRes.success) {
            setOrgName(orgRes.organization.name);
            setOrgDbId(orgRes.organization._id || orgRes.organization.id);
            setDynamicFields(orgRes.organization.dynamicFields || []);
          }

          // Fetch user preference overrides
          const prefRes = await fetch('/api/user/preferences').then((res) => res.json());
          if (prefRes.success) {
            setUserPrefs(prefRes.preferences.fieldDefaults || {});
          }

          const isAdminRole = auth.user.role === 'admin' || auth.user.role === 'superAdmin';
          if (isAdminRole) {
            setLoadingUsers(true);
            const userRes = await fetch('/api/organization/users').then((res) => res.json());
            if (userRes.success) {
              setOrgUsers(userRes.users || []);
            }
            setLoadingUsers(false);
          }

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

  const handleCreateOrgUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserFormSuccess('');
    setUserFormError('');
    try {
      const res = await apiClient.createOrganizationUser(newUserForm);
      if (res.success) {
        setUserFormSuccess(`User @${newUserForm.username} created successfully!`);
        setNewUserForm({ name: '', username: '', password: '', role: 'user' });
        fetchOrgUsers();
      } else {
        setUserFormError(res.error || 'Failed to create user.');
      }
    } catch (err) {
      setUserFormError('An error occurred.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    router.push('/');
  };

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

  // Preference management
  const handlePrefChange = (fieldName, val) => {
    setUserPrefs({
      ...userPrefs,
      [fieldName]: val
    });
  };

  const handleSaveUserPrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldDefaults: userPrefs })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Personal default preferences saved successfully!');
        setUserPrefs(data.preferences.fieldDefaults || {});
      } else {
        setError(data.error || 'Failed to save preferences.');
      }
    } catch (err) {
      setError('An error occurred while saving preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Admin dynamic field schema management
  const handleAddDynamicField = () => {
    const newField = {
      name: 'field_' + Math.random().toString(36).substr(2, 5),
      label: 'New Custom Field',
      type: 'dropdown',
      options: ['Option A', 'Option B'],
      defaultValue: 'Option A'
    };
    setDynamicFields([...dynamicFields, newField]);
  };

  const handleUpdateField = (index, key, value) => {
    const copy = [...dynamicFields];
    if (key === 'options' && typeof value === 'string') {
      copy[index] = {
        ...copy[index],
        options: value.split(',').map(s => s.trim()).filter(Boolean)
      };
    } else {
      copy[index] = {
        ...copy[index],
        [key]: value
      };
    }
    setDynamicFields(copy);
  };

  const handleRemoveField = (index) => {
    setDynamicFields(dynamicFields.filter((_, i) => i !== index));
  };

  const handleSaveOrgConfig = async () => {
    setSavingOrg(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/organization/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dynamicFields })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Organization dynamic field configurations saved successfully!');
        setDynamicFields(data.dynamicFields);
      } else {
        setError(data.error || 'Failed to save organization configuration.');
      }
    } catch (err) {
      setError('An error occurred while saving organization configuration.');
    } finally {
      setSavingOrg(false);
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

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  return (
    <div className="min-h-screen bg-black text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between gap-3 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <Link
              href={currentUser ? `/${currentUser.orgId || 'dialedin'}/${currentUser.userId || currentUser.id}` : "/"}
              className="h-10 w-10 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 flex items-center justify-center transition-colors"
              title="Return to main dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Account Settings</h1>
              <p className="text-xs text-zinc-400 mt-0.5">Customize your personal bio, default field preferences, and team configurations</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-rose-455 px-2.5 py-1 rounded-lg transition border border-zinc-705 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
          </button>
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
            <ShieldAlert className="w-4 h-4 text-rose-455 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Avatar / Quick Overview */}
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 flex flex-col items-center text-center space-y-6 h-fit">
            <div className="relative group">
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
              <div className="mt-2 flex flex-col gap-1.5 items-center">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  Role: {currentUser?.role?.toUpperCase() || 'USER'}
                </span>
                {orgName && (
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-orange-450">
                    Org: {orgName}
                  </span>
                )}
              </div>
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
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
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
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
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
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-655" />
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
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-655" />
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
                  <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-655" />
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
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-655" />
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
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full sm:w-auto bg-transparent hover:bg-rose-950/20 text-rose-455 hover:text-rose-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition border border-rose-900/30 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dynamic Fields Overrides (Personal Preferences) */}
        {dynamicFields.length > 0 && (
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Settings className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Personal Default Preferences
                </h3>
                <p className="text-[10.5px] text-zinc-400 mt-0.5">
                  Configure default values for custom task creation fields. These overrides only apply to your sessions.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUserPrefs} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dynamicFields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-350">{field.label}</label>
                    {field.type === 'dropdown' || field.type === 'selector' ? (
                      <div className="relative">
                        <select
                          value={userPrefs[field.name] ?? ''}
                          onChange={(e) => handlePrefChange(field.name, e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                        >
                          <option value="">No personal override (Use organization default)</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-405">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    ) : field.type === 'text' ? (
                      <input
                        type="text"
                        value={userPrefs[field.name] ?? ''}
                        onChange={(e) => handlePrefChange(field.name, e.target.value)}
                        placeholder="No personal override"
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                      />
                    ) : field.type === 'toggle' ? (
                      <div className="relative">
                        <select
                          value={userPrefs[field.name] === undefined ? '' : String(userPrefs[field.name])}
                          onChange={(e) => {
                            const val = e.target.value;
                            handlePrefChange(field.name, val === '' ? undefined : val === 'true');
                          }}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                        >
                          <option value="">No personal override (Use organization default)</option>
                          <option value="true">ON / Enabled</option>
                          <option value="false">OFF / Disabled</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-405">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 disabled:opacity-50"
                >
                  {savingPrefs ? 'Saving Preferences...' : 'Save Default Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Organization Field Schema Manager (Admin and Super Admin only) */}
        {isAdmin && (
          <div className="bg-[#0b0b0b] p-6 rounded-2xl border border-zinc-800/80 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-500">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Organization Custom Fields Configuration
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Define and update custom metadata fields displayed across all tasks for the team.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddDynamicField}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-orange-600/15 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Field
              </button>
            </div>

            {dynamicFields.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                No custom fields configured yet. Click "Add New Field" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {dynamicFields.map((field, idx) => {
                  const optionsList = field.options || [];

                  return (
                    <div
                      key={field.name || idx}
                      className="p-5 bg-zinc-950/80 border border-zinc-850 rounded-xl space-y-4 relative hover:border-zinc-800 transition duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-500/15 text-orange-400 rounded-md border border-orange-500/10">
                            Field #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-zinc-350">
                            {field.label || 'Unnamed Field'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="text-zinc-500 hover:text-rose-400 transition p-1.5 hover:bg-zinc-900 rounded-lg"
                          title="Delete Field"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* Field Key */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Field Database Key
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            placeholder="e.g. work_type"
                            onChange={(e) => {
                              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                              handleUpdateField(idx, 'name', val);
                            }}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-zinc-700"
                          />
                          <p className="text-[9.5px] text-zinc-550 mt-1">
                            Must be lowercase, letters & underscores only.
                          </p>
                        </div>

                        {/* Field Display Label */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Display Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            placeholder="e.g. Type of Work"
                            onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-zinc-700"
                          />
                          <p className="text-[9.5px] text-zinc-555 mt-1">
                            Name displayed on forms and reports.
                          </p>
                        </div>

                        {/* Field Type */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Input Control Type
                          </label>
                          <div className="relative">
                            <select
                              value={field.type}
                              onChange={(e) => {
                                const type = e.target.value;
                                handleUpdateField(idx, 'type', type);
                                if (type === 'dropdown' || type === 'selector') {
                                  handleUpdateField(idx, 'options', field.options || []);
                                }
                              }}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                            >
                              <option value="dropdown">Dropdown Options</option>
                              <option value="selector">Selector Pill Buttons</option>
                              <option value="text">Text Input Line</option>
                              <option value="toggle">Toggle Checkbox</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options Setup */}
                      {(field.type === 'dropdown' || field.type === 'selector') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/60 rounded-lg border border-zinc-900/60 mt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                              Configure Options (comma separated)
                            </label>
                            <input
                              type="text"
                              value={optionsList.join(', ')}
                              onChange={(e) => {
                                const opts = e.target.value.split(',').map(o => o.trim()).filter(Boolean);
                                handleUpdateField(idx, 'options', opts);
                              }}
                              placeholder="e.g. Dev, QA, Design"
                              className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-zinc-700"
                            />
                            {optionsList.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {optionsList.map((opt) => (
                                  <span key={opt} className="text-[9px] font-semibold bg-zinc-900 text-zinc-305 border border-zinc-800 px-2 py-0.5 rounded-full">
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                              Default Value
                            </label>
                            <div className="relative">
                              <select
                                value={field.defaultValue || ''}
                                onChange={(e) => handleUpdateField(idx, 'defaultValue', e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                              >
                                <option value="" className="text-zinc-600">Select Default Option...</option>
                                {optionsList.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Text Input Defaults Setup */}
                      {field.type === 'text' && (
                        <div className="p-4 bg-black/60 rounded-lg border border-zinc-900/60 mt-2">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Default Text Value
                          </label>
                          <input
                            type="text"
                            placeholder="Optional default pre-filled text..."
                            value={field.defaultValue || ''}
                            onChange={(e) => handleUpdateField(idx, 'defaultValue', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-zinc-700"
                          />
                        </div>
                      )}

                      {/* Toggle Default State Setup */}
                      {field.type === 'toggle' && (
                        <div className="p-4 bg-black/60 rounded-lg border border-zinc-900/60 mt-2">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Default State
                          </label>
                          <div className="relative w-full max-w-xs">
                            <select
                              value={field.defaultValue === undefined ? '' : String(field.defaultValue)}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateField(idx, 'defaultValue', val === '' ? undefined : val === 'true');
                              }}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                            >
                              <option value="false">Off (Unchecked)</option>
                              <option value="true">On (Checked)</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                type="button"
                onClick={handleSaveOrgConfig}
                disabled={savingOrg}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-orange-600/15 disabled:opacity-50"
              >
                {savingOrg ? 'Saving Configuration...' : 'Save Organization Schema'}
              </button>
            </div>
          </div>
        )}

        {/* Team Management (Admin and Super Admin only) */}
        {isAdmin && (
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-500" />
                <span>Team & User Management</span>
              </h3>
              <p className="text-[10.5px] text-zinc-405 mt-1">
                Add, manage, and assign credentials for employees/workers under your organization namespace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User list */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Organization Members</span>
                {loadingUsers ? (
                  <div className="text-center py-6 text-zinc-555 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-500 mb-2" />
                    <span>Loading team members...</span>
                  </div>
                ) : orgUsers.length === 0 ? (
                  <div className="text-center py-6 text-zinc-555 text-xs">
                    No users registered in this organization yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {orgUsers.map((u) => (
                      <div key={u.id} className="p-3 bg-black border border-zinc-850 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-white">{u.name}</p>
                          <p className="text-[10.5px] text-orange-400 font-mono">@{u.username}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'admin' 
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create User Form */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Create New User</span>
                
                {userFormSuccess && (
                  <div className="p-3 bg-emerald-955/20 border border-emerald-900/30 rounded-xl text-emerald-350 text-xs">
                    {userFormSuccess}
                  </div>
                )}
                {userFormError && (
                  <div className="p-3 bg-rose-955/20 border border-rose-900/30 rounded-xl text-rose-350 text-xs">
                    {userFormError}
                  </div>
                )}

                <form onSubmit={handleCreateOrgUser} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bob Smith"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="e.g. bob_dev"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Role</label>
                    <div className="relative">
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                      >
                        <option value="user">User / Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20 disabled:opacity-50"
                  >
                    {creatingUser ? 'Creating User...' : 'Create User Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-6">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-450">
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
