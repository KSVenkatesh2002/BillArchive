'use client';

import { useSelector } from 'react-redux';

export default function Toast(props) {
  const storeToastMessage = useSelector((state) => state.ui.toastMessage);
  const message = props.message || storeToastMessage;

  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-bounce">
      <span>✨</span>
      <span>{message}</span>
    </div>
  );
}
