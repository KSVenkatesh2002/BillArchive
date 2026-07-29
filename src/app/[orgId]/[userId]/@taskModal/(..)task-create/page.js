'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { apiClient } from '@/lib/apiClient';
export const dynamic = 'force-dynamic';
import TaskFormModal from '@/components/TaskFormModal';

export default function InterceptedTaskCreateModal() {
  const { username } = useParams();
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectVal = form.dynamicValues?.project || form.project;
    if (!form.name || !projectVal) return;

    try {
      const taskData = {
        name: form.name,
        nickName: form.nickName || '',
        status: form.status,
        project: projectVal,
        source: form.dynamicValues?.source || form.source || undefined,
        typeOfWork: form.dynamicValues?.typeOfWork || form.typeOfWork || undefined,
        clickupId: form.clickupId,
        dynamicValues: form.dynamicValues || {},
        bill: {
          allocatedHours: parseFloat(form.allocatedHours || 0),
          billedHours: parseFloat(form.billedHours || 0),
          actualHours: parseFloat(form.actualHours || 0),
        }
      };

      const data = await apiClient.createTask(taskData);
      if (data.success) {
        router.back();
        // Give router a tiny moment to go back before refreshing
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        alert(data.error || 'Failed to create task');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  return (
    <TaskFormModal
      show={true}
      isEdit={false}
      form={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      onClose={() => router.back()}
    />
  );
}
