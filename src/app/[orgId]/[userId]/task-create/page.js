'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { createTask } from '@/lib/store/taskSlice';
import TaskFormModal from '@/components/TaskFormModal';

export default function UserTaskCreatePage() {
  const { userId, orgId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: '',
    nickName: '',
    status: 'inprocess',
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
        const loggedUserId = data.user?.id || data.user?.userId;
        const userOrgId = data.user?.orgId || 'dialedin';
        if (loggedUserId && loggedUserId !== userId) {
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

    if (!form.name || !form.name.trim()) {
      alert('Please enter a Task Name.');
      return;
    }

    const projectVal = form.dynamicValues?.project || form.project || 'General';

    try {
      const payload = {
        name: form.name.trim(),
        nickName: form.nickName || '',
        status: form.status || 'inprocess',
        project: projectVal,
        source: form.dynamicValues?.source || form.source || undefined,
        typeOfWork: form.dynamicValues?.typeOfWork || form.typeOfWork || undefined,
        clickupId: form.clickupId,
        dynamicValues: {
          ...(form.dynamicValues || {}),
          project: projectVal
        },
        bill: {
          allocatedHours: parseFloat(form.allocatedHours || 0),
          billedHours: parseFloat(form.billedHours || 0),
          actualHours: parseFloat(form.actualHours || 0),
        }
      };

      const result = await dispatch(createTask(payload)).unwrap();
      if (result && result.success) {
        router.push(`/${orgId || 'dialedin'}/${userId}`);
      } else {
        alert(result?.error || 'Failed to save task.');
      }
    } catch (err) {
      console.error(err);
      alert(typeof err === 'string' ? err : err?.message || 'An error occurred while creating the task.');
    }
  };

  if (authChecking) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center">
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
