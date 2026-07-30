'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { createTask } from '@/lib/store/taskSlice';
import TaskFormModal from '@/components/TaskFormModal';

export const dynamic = 'force-dynamic';

export default function InterceptedTaskCreateModal() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!form.name || !form.name.trim()) {
      alert('Please enter a Task Name.');
      return;
    }

    const projectVal = form.dynamicValues?.project || form.project || 'General';
    setIsSubmitting(true);

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
        router.back();
      } else {
        alert(result?.error || 'Failed to create task');
      }
    } catch (err) {
      console.error(err);
      alert(typeof err === 'string' ? err : err?.message || 'An error occurred while creating the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TaskFormModal
      show={true}
      isEdit={false}
      form={form}
      onChange={setForm}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={() => router.back()}
    />
  );
}
