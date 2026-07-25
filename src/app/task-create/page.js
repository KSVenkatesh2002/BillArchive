'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';

export default function RootTaskCreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        const data = await apiClient.checkAuth();
        if (data.authenticated && data.user?.username) {
          router.replace(`/${data.user.username}/task-create`);
        } else {
          router.replace('/login?redirect=/task-create');
        }
      } catch (err) {
        console.error(err);
        router.replace('/login');
      }
    }
    checkAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400">
      <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-sm font-medium font-balmain tracking-wider">Redirecting to task creation...</p>
    </div>
  );
}
