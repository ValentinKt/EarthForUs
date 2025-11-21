import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { report } from '../utils/errorReporter';

type ToastVariant = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextType = {
  show: (message: string, variant?: ToastVariant, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = 'info', title?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, title, variant }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const success = useCallback((message: string, title?: string) => show(message, 'success', title), [show]);
  const error = useCallback((message: string, title?: string) => {
    show(message, 'error', title);
    report({ message }, 'UI Error', { title });
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, success, error }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[90%] max-w-md">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-xl px-4 py-3 shadow-lg text-white ${t.variant === 'success' ? 'bg-teal-600' : t.variant === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
            {t.title ? <p className="font-semibold">{t.title}</p> : null}
            <p className="text-sm">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
