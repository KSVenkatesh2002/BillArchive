'use client';

import { useState } from 'react';
import PublicHeader from '@/components/PublicHeader';
import { CONFIG } from '@/lib/config';
import { Send, RefreshCw, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to send message.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-balmain font-light text-white mb-4">
            Contact <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-medium">Us</span>
          </h1>
          <p className="text-zinc-400">
            Have a question or need support? Send us a message and we'll get back to you shortly.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Message Sent!</h3>
            <p className="text-zinc-400">Thank you for reaching out. We will review your message and reply soon.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6">
            {status === 'error' && (
              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-400 text-sm">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-orange-500 transition resize-none"
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
