'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { apiClient } from '@/lib/apiClient';

export default function RegisterModal() {
  const [form, setForm] = useState({ username: '', password: '', name: '', orgName: '' });
  const [error, setError] = useState('');
  const [mode, setMode] = useState('register');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = mode === 'login' 
        ? await apiClient.login(form.username, form.password)
        : await apiClient.register(form.name, form.username, form.password, form.orgName);

      if (data.success) {
        const userId = data.user?.id || data.user?.userId;
        const orgId = data.user?.orgId || 'dialedin';
        const role = data.user?.role || 'user';
        router.back();
        setTimeout(() => {
          if (role === 'superAdmin' || (data.user?.username || '').toLowerCase() === 'admin') {
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
      onClose={() => router.back()}
    />
  );
}
