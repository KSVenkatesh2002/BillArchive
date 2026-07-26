'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
      const payload = {
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

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
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
