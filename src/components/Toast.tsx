import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/video';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-xl bg-white transition-all duration-300 animate-slide-up ${
            toast.type === 'success'
              ? 'border-orange-200 text-slate-800'
              : toast.type === 'error'
              ? 'border-red-200 text-slate-800'
              : 'border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-orange-500 shrink-0" />}
            <span className="text-sm font-medium leading-snug truncate">{toast.message}</span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
