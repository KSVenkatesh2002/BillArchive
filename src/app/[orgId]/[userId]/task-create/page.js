'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import TaskFormModal from '@/components/TaskFormModal';

export default function UserTaskCreatePage() {
  const { userId, orgId } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    nickName: '',
    status: 'inprocess',
    project: '',
    source: 'dialedin',
    typeOfWork: 'dev',
    allocatedHours: '',
    billedHours: '',
    actualHours: '',
    clickupId: '',
    dynamicValues: {}
  });

  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const verifyAuth = async () => {
      try {
        const data = await apiClient.checkAuth();
        if (!data.authenticated) {
          router.push('/login');
          return;
        }
        const loggedUserId = data.user.userId;
        const userOrgId = data.user.orgId || 'dialedin';
        if (loggedUserId !== userId) {
          router.push(`/${userOrgId}/${loggedUserId}/task-create`);
        } else {
          setAuthChecking(false);
        }
      } catch (err) {
        router.push('/login');
      }
    };
    verifyAuth();
  }, [router, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;

    try {
      const payload = {
        name: form.name,
        nickName: form.nickName || '',
        status: form.status,
        project: form.project || form.dynamicValues?.project || '',
        source: form.source || form.dynamicValues?.source || undefined,
        typeOfWork: form.typeOfWork || form.dynamicValues?.typeOfWork || undefined,
        clickupId: form.clickupId,
        dynamicValues: form.dynamicValues || {},
        bill: {
          allocatedHours: parseFloat(form.allocatedHours || 0),
          billedHours: parseFloat(form.billedHours || 0),
          actualHours: parseFloat(form.actualHours || 0),
        }
      };

      const data = await apiClient.createTask(payload);
      if (data.success) {
        router.push(`/${orgId || 'dialedin'}/${userId}`);
        router.refresh();
      } else {
        alert(data.error || 'Failed to save task.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center">
        <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-4">
        <div>
          <Link href={`/${orgId || 'dialedin'}/${userId}`} className="text-zinc-400 hover:text-white text-xs font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
        <TaskFormModal
          show={true}
          isEdit={false}
          inline={true}
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
