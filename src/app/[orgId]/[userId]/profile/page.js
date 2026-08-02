'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { updateOrgConfig, DEFAULT_ENABLED_FIELDS, BUILTIN_FIELD_LABELS, DISPLAY_LOCATION_OPTIONS } from '@/lib/store/orgSlice';
import { CONFIG } from '@/lib/config';
import SectionCard from '@/components/SectionCard';
import Select from '@/components/Select';
import Toggle from '@/components/Toggle';
import TeamManager from './components/TeamManager';
import ProjectConfig from './components/ProjectConfig';
import StatusConfig from './components/StatusConfig';
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
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [invalidUrl, setInvalidUrl] = useState(false);
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
  const [enabledFields, setEnabledFields] = useState({ ...DEFAULT_ENABLED_FIELDS });
  const [userPrefs, setUserPrefs] = useState({});
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgStatuses, setOrgStatuses] = useState([]);

  const router = useRouter();

  useEffect(() => {
    async function init() {
      if (userId === 'undefined' || orgId === 'undefined') {
        setInvalidUrl(true);
        setLoadingAuth(false);
        return;
      }

      try {
        const auth = await apiClient.checkAuth();
        if (auth.authenticated && auth.user) {
          if (auth.user.id !== userId || auth.user.orgId !== orgId) {
          if (auth.user.role !== 'superAdmin' && !auth.user.orgId) {
            alert('Your account is not linked to any organization.');
            return;
          }
          router.push(`/${auth.user.orgId}/${auth.user.id}/profile`);
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

          const orgRes = await apiClient.getOrganizationConfig();
          if (orgRes.success) {
            setOrgName(orgRes.organization.name);
            setOrgDbId(orgRes.organization._id || orgRes.organization.id);
            setDynamicFields(orgRes.organization.dynamicFields || []);
            if (orgRes.organization.enabledFields) {
              setEnabledFields({ ...DEFAULT_ENABLED_FIELDS, ...orgRes.organization.enabledFields });
            }
          }

          // Fetch user preference overrides
          const prefRes = await apiClient.getUserPreferences();
          if (prefRes.success) {
            setUserPrefs(prefRes.preferences.fieldDefaults || {});
          }

          // Fetch organization statuses
          if (auth.user.role === 'admin' || auth.user.role === 'superAdmin') {
            const targetOrgId = auth.user.role === 'superAdmin' ? 'system_default' : auth.user.orgId;
            const statusRes = await apiClient.getStatuses(targetOrgId);
            if (statusRes.success) {
              setOrgStatuses(statusRes.statuses || []);
            }
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
      const data = await apiClient.saveUserPreferences(userPrefs);
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
      name: 'field_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      label: '',
      type: 'dropdown',
      options: [],
      defaultValue: '',
      displayLocation: 'table'
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

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSaveOrgConfig = async (overrideEnabledFields = null) => {
    setSavingOrg(true);
    setError('');
    setSuccess('');
    try {
      const data = await dispatch(updateOrgConfig({ dynamicFields, enabledFields: overrideEnabledFields || enabledFields })).unwrap();
      if (data.success) {
        setSuccess('Organization configurations saved successfully!');
        setDynamicFields(data.dynamicFields || []);
        if (data.enabledFields) {
          setEnabledFields({ ...DEFAULT_ENABLED_FIELDS, ...data.enabledFields });
        }
      } else {
        setError(data.error || 'Failed to save organization configuration.');
      }
    } catch (err) {
      setError(err || 'An error occurred while saving organization configuration.');
    } finally {
      setSavingOrg(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center text-zinc-500 py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="text-sm font-semibold">Loading Profile Context...</p>
      </div>
    );
  }

  if (invalidUrl) {
    return (
      <div className="flex flex-col items-center justify-center text-zinc-500 py-24 px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Invalid Profile URL</h2>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          The URL you are trying to access is malformed or missing the correct user identifier.
        </p>
        <Link href="/" className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-lg shadow-orange-600/20">
          Return Home
        </Link>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between gap-3 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <Link
              href={currentUser ? (currentUser.orgId ? `/${currentUser.orgId}/${currentUser.userId || currentUser.id}` : '#') : "/"}
              onClick={(e) => {
                if (currentUser && currentUser.role !== 'superAdmin' && !currentUser.orgId) {
                  e.preventDefault();
                  alert('Your account is not assigned to any organization. Please contact an administrator.');
                }
              }}
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

        {/* Floating Success/Error Alerts (Toast) */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
          {success && (
            <div className="p-4 bg-emerald-900/90 border border-emerald-500/50 rounded-2xl text-emerald-50 text-sm flex items-center gap-3 shadow-2xl shadow-emerald-900/50 animate-slideUp pointer-events-auto max-w-sm">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">{success}</span>
            </div>
          )}
          {error && (
            <div className="p-4 bg-rose-900/90 border border-rose-500/50 rounded-2xl text-rose-50 text-sm flex items-center gap-3 shadow-2xl shadow-rose-900/50 animate-slideUp pointer-events-auto max-w-sm">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Avatar / Quick Overview */}
          <SectionCard className="flex flex-col items-center text-center h-fit">
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
              <p className="text-xs text-orange-400 font-mono mt-0.5">{currentUser?.email}</p>
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
          </SectionCard>

          {/* Right panel: Profile Editor Form */}
          <SectionCard className="lg:col-span-2">
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
          </SectionCard>
        </div>

        {/* Dynamic Fields Overrides (Personal Preferences) */}
        {dynamicFields.length > 0 && (
          <SectionCard>
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
                    {field.type === 'dropdown' ? (
                      <Select
                        value={userPrefs[field.name] ?? ''}
                        onChange={(e) => handlePrefChange(field.name, e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                      >
                        <option value="">No personal override (Use organization default)</option>
                        {(field.options || []).map((opt, oIdx) => (
                          <option key={`${opt}-${oIdx}`} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    ) : field.type === 'pill' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrefChange(field.name, '')}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition border ${
                            (userPrefs[field.name] ?? '') === '' 
                              ? 'bg-zinc-800 text-white border-zinc-700' 
                              : 'bg-black text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          No Override
                        </button>
                        {(field.options || []).map((opt, oIdx) => (
                          <button
                            key={`${opt}-${oIdx}`}
                            type="button"
                            onClick={() => handlePrefChange(field.name, opt)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition border ${
                              userPrefs[field.name] === opt 
                                ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/20' 
                                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
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
                      <div className="flex items-center gap-4 py-1.5">
                        <Toggle
                          checked={userPrefs[field.name] === true}
                          onChange={(checked) => handlePrefChange(field.name, checked)}
                        />
                        {userPrefs[field.name] !== undefined ? (
                          <button
                            type="button"
                            onClick={() => handlePrefChange(field.name, undefined)}
                            className="text-[10px] font-bold text-orange-500 hover:text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md transition"
                          >
                            Clear Override
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">Using Organization Default</span>
                        )}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center gap-4 py-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={userPrefs[field.name] === true}
                            onChange={(e) => handlePrefChange(field.name, e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-700 text-orange-600 focus:ring-orange-500 bg-black accent-orange-600 cursor-pointer"
                          />
                          <span className="text-xs text-zinc-400">Enable</span>
                        </div>
                        {userPrefs[field.name] !== undefined ? (
                          <button
                            type="button"
                            onClick={() => handlePrefChange(field.name, undefined)}
                            className="text-[10px] font-bold text-orange-500 hover:text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md transition"
                          >
                            Clear Override
                          </button>
                        ) : null}
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
          </SectionCard>
        )}

        {/* Organization Field Schema Manager (Admin and Super Admin only) */}
        {isAdmin && (
          <SectionCard className="!bg-[#0b0b0b] shadow-xl">
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

            {/* Built-in Field Visibility Checkbox Toggles */}
            <div className="bg-black/80 p-5 rounded-xl border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Enabled Built-in Fields Checklist
              </div>
              <p className="text-[11px] text-zinc-400">
                Check or uncheck options to control which standard fields are visible on team forms, task lists, and metrics:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {Object.entries(BUILTIN_FIELD_LABELS).map(([key, label]) => ({ key, label })).map((item) => {
                  const isChecked = enabledFields[item.key] !== false;
                  return (
                    <label 
                      key={item.key} 
                      className={`flex items-center justify-center gap-2.5 cursor-pointer text-xs font-bold uppercase tracking-wider p-2.5 rounded-lg border transition ${
                        isChecked 
                          ? 'bg-orange-600/10 text-orange-500 border-orange-500/50 shadow-sm shadow-orange-600/10' 
                          : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800/60 hover:text-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = { ...enabledFields, [item.key]: e.target.checked };
                          setEnabledFields(updated);
                          handleSaveOrgConfig(updated);
                        }}
                        className="hidden"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {dynamicFields.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                No custom fields configured yet. Click &quot;Add New Field&quot; to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {dynamicFields.map((field, idx) => {
                  const optionsList = field.options || [];

                  return (
                    <div
                      key={field.name || idx}
                      className="p-5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-4 relative transition duration-200 group"
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">                        {/* Field Display Label */}
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
                          <Select
                            value={field.type}
                            onChange={(e) => {
                              const type = e.target.value;
                              setDynamicFields(prev => {
                                const updated = [...prev];
                                updated[idx] = { ...updated[idx], type };
                                if (type === 'dropdown' || type === 'pill') {
                                  updated[idx].options = updated[idx].options || [];
                                }
                                return updated;
                              });
                            }}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                          >
                            <option value="dropdown">Dropdown</option>
                            <option value="pill">Pill Selector</option>
                            <option value="text">Text</option>
                            <option value="toggle">Toggle</option>
                            <option value="checkbox">Checkbox</option>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            Display Location
                          </label>
                          <Select
                            value={field.displayLocation || 'table'}
                            onChange={(e) => handleUpdateField(idx, 'displayLocation', e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                          >
                            {DISPLAY_LOCATION_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      {/* Dropdown Options Setup */}
                      {(field.type === 'dropdown' || field.type === 'pill') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/60 rounded-lg border border-zinc-900/60 mt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                              Configure Options (comma separated)
                            </label>
                            <input
                              type="text"
                              value={field._rawOptions ?? optionsList.join(', ')}
                              onChange={(e) => {
                                const raw = e.target.value;
                                setDynamicFields(prev => {
                                  const updated = [...prev];
                                  const opts = raw.split(',').map(o => o.trim()).filter(Boolean);
                                  updated[idx] = { ...updated[idx], _rawOptions: raw, options: opts };
                                  return updated;
                                });
                              }}
                              placeholder="e.g. Dev, QA, Design"
                              className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-zinc-700"
                            />
                            {optionsList.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {optionsList.map((opt, oIdx) => (
                                  <span key={`${opt}-${oIdx}`} className="text-[9px] font-semibold bg-zinc-900 text-zinc-305 border border-zinc-800 px-2 py-0.5 rounded-full">
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
                                {optionsList.map((opt, oIdx) => (
                                  <option key={`${opt}-${oIdx}`} value={opt}>
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
                onClick={() => handleSaveOrgConfig()}
                disabled={savingOrg}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-orange-600/15 disabled:opacity-50"
              >
                {savingOrg ? 'Saving Configuration...' : 'Save Organization Schema'}
              </button>
            </div>
          </SectionCard>
        )}

        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ProjectConfig initialDynamicFields={dynamicFields} />
            <StatusConfig 
              initialStatuses={orgStatuses} 
              orgId={currentUser?.role === 'superAdmin' ? 'system_default' : currentUser?.orgId} 
            />
          </div>
        )}

        <TeamManager isAdmin={isAdmin} />

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
