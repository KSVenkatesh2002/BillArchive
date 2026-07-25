'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TaskFormModal from '@/components/TaskFormModal';

export default function InterceptedTaskCreateModal() {
  const { username } = useParams();
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
    clickupId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.project) return;

    try {
      const payload = {
        name: form.name,
        nickName: form.nickName || '',
        status: form.status,
        project: form.project,
        source: form.source,
        typeOfWork: form.typeOfWork,
        clickupId: form.clickupId,
        bill: {
          allocatedHours: parseFloat(form.allocatedHours || 0),
          billedHours: parseFloat(form.billedHours || 0),
          actualHours: parseFloat(form.actualHours || 0),
        }
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.back();
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        alert(data.error || 'Failed to save task.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
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
