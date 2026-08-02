'use client';

import { useAdmin } from '../layout';

export default function UsersTab() {
  const { adminData } = useAdmin();

  if (!adminData) return null;

  return (
    <div className="space-y-6">
      {Object.entries((adminData?.users || []).reduce((acc, u) => {
        const orgName = u.organization || 'Unassigned';
        if (!acc[orgName]) acc[orgName] = [];
        acc[orgName].push(u);
        return acc;
      }, {})).map(([org, users]) => (
        <div key={org} className="bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{org} Users ({users.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900/60 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-[#070707]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[10px]">{u._id}</td>
                    <td className="py-3.5 px-4 font-bold text-zinc-100">{u.name}</td>
                    <td className="py-3.5 px-4 font-mono text-orange-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.role === 'admin' 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                        : u.role === 'superAdmin'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-right">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
