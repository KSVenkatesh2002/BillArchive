'use client';

import { useState } from 'react';
import { useAdmin } from '../layout';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function BillsTab() {
  const { adminData, fetchAdminData } = useAdmin();
  const [billForm, setBillForm] = useState({
    title: '',
    clientName: '',
    amount: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  });
  const [submittingBill, setSubmittingBill] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  if (!adminData) return null;

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!billForm.title || !billForm.clientName || !billForm.amount) return;
    setSubmittingBill(true);
    setFormSuccess('');

    try {
      const res = await apiClient.createBill(billForm);
      if (res.success) {
        setFormSuccess('Bill logged successfully!');
        setBillForm({
          title: '',
          clientName: '',
          amount: '',
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
        });
        fetchAdminData();
      } else {
        alert(res.error || 'Failed to create bill.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating the bill.');
    } finally {
      setSubmittingBill(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ledger Listing */}
      <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/20">
          <h3 className="text-sm font-bold text-white">Client Bill Invoices Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-900/40 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Invoice Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-[#070707]">
              {adminData?.bills?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-zinc-550 font-medium">
                    No client billing matrices records found.
                  </td>
                </tr>
              ) : (
                adminData?.bills?.map((b) => (
                  <tr key={b._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-zinc-100">{b.title}</td>
                    <td className="py-3.5 px-4 font-medium text-zinc-300">{b.clientName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${b.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        b.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                          : b.status === 'Overdue'
                          ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-right font-mono">{b.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form to log client bill */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4 h-fit">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4.5 h-4.5 text-orange-400" />
            <span>Log New Invoice Bill</span>
          </h3>
          <p className="text-[10px] text-zinc-450 mt-0.5">Insert bill record into the active database</p>
        </div>

        {formSuccess && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-350 text-xs">
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Invoice Item / Title</label>
            <input
              type="text"
              placeholder="e.g. AWS Cloud Infrastructure"
              value={billForm.title}
              onChange={(e) => setBillForm({ ...billForm, title: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Client Name</label>
            <input
              type="text"
              placeholder="e.g. Initech Corp"
              value={billForm.clientName}
              onChange={(e) => setBillForm({ ...billForm, clientName: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={billForm.amount}
                onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Status</label>
              <select
                value={billForm.status}
                onChange={(e) => setBillForm({ ...billForm, status: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Pending" className="bg-black">Pending</option>
                <option value="Paid" className="bg-black">Paid</option>
                <option value="Overdue" className="bg-black">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-405 mb-1">Billing Date</label>
            <input
              type="date"
              value={billForm.date}
              onChange={(e) => setBillForm({ ...billForm, date: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submittingBill}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-1.5 disabled:opacity-55"
          >
            <Plus className="w-4 h-4" />
            <span>{submittingBill ? 'Logging Bill...' : 'Create Invoice'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
