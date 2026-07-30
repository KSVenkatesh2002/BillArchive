'use client';

import { useState, useEffect } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import { apiClient } from '@/lib/apiClient';

export default function TeamManager({ isAdmin }) {
  const [orgUsers, setOrgUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [userFormError, setUserFormError] = useState('');

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
    if (isAdmin) {
      setTimeout(() => fetchOrgUsers(), 0);
    }
  }, [isAdmin]);

  const handleCreateOrgUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserFormSuccess('');
    setUserFormError('');
    try {
      const res = await apiClient.createOrganizationUser(newUserForm);
      if (res.success) {
        setUserFormSuccess(`User ${newUserForm.email} created successfully!`);
        setNewUserForm({ name: '', email: '', password: '', role: 'user' });
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

  if (!isAdmin) return null;

  return (
    <SectionCard>
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
                    <p className="text-[10.5px] text-orange-400 font-mono">{u.email}</p>
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
              <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Email</label>
              <input
                type="email"
                placeholder="e.g. bob@example.com"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
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
    </SectionCard>
  );
}
