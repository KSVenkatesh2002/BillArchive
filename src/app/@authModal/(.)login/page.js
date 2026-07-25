'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { apiClient } from '@/lib/apiClient';

export default function LoginModal() {
  const [form, setForm] = useState({ username: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = mode === 'login' 
        ? await apiClient.login(form.username, form.password)
        : await apiClient.register(form.name, form.username, form.password);

      if (data.success) {
        // Go back (closes modal) and refresh parent page state
        router.back();
        setTimeout(() => {
          window.location.reload();
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
