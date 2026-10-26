import React from 'react';
import { X } from 'lucide-react';
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
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 border border-black bg-black text-white rounded-none animate-slide-up"
        >
          <span className="text-xs font-mono font-bold leading-snug truncate">
            {toast.message}
          </span>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-white hover:opacity-70 transition-opacity shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
