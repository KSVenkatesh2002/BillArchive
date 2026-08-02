'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { apiClient } from '@/lib/apiClient';

export default function RegisterModal() {
  const [form, setForm] = useState({ email: '', password: '', name: '', orgName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('register');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = mode === 'login' 
        ? await apiClient.login(form.email, form.password)
        : await apiClient.register(form.name, form.email, form.password, form.orgName);

      if (data.success) {
        const userId = data.user?.id || data.user?.userId;
        const orgId = data.user?.orgId;
        const role = data.user?.role || 'user';
        
        if (role !== 'superAdmin' && !orgId) {
          setError('Registration failed: no organization assigned. Please contact support.');
          setLoading(false);
          return;
        }
        router.back();
        setTimeout(() => {
          if (role === 'superAdmin' || (data.user?.email || '').toLowerCase() === 'admin@dialed.in') {
            window.location.href = '/superadmin';
          } else {
            window.location.href = `/${orgId}/${userId}`;
          }
        }, 100);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal
      show={true}
      mode={mode}
      setMode={setMode}
      form={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      onClose={() => router.back()}
    />
  );
}
