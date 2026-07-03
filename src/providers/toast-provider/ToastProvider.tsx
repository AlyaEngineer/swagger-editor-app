'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { Toast } from './Toast';
import { ToastType } from './types';

type ToastContextValue = {
  showToast: (message: string, severity?: ToastType) => void;
};

type ToastState = {
  message: string;
  open: boolean;
  severity: ToastType;
};

const ToastContext = createContext<null | ToastContextValue>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    open: false,
    severity: 'success',
  });

  const showToast = useCallback((message: string, severity: ToastType = 'success') => {
    setToast({ message, open: true, severity });
  }, []);

  const handleClose = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <Toast
        message={toast.message}
        onClose={handleClose}
        open={toast.open}
        severity={toast.severity}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
