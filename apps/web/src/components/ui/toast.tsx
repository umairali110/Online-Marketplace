'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { clsx } from 'clsx';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const ToastContext = createContext<{ show: (message: string, type?: Toast['type']) => void }>({
  show: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'rounded-btn px-4 py-3 text-sm font-medium text-white shadow-md',
              t.type === 'success' ? 'bg-success' : 'bg-danger',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);