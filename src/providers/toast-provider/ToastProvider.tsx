'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { Toast } from './Toast';
import { ToastType } from './types';

type ShowToast = (message: string, severity?: ToastType) => void;

type ToastState = {
  message: string;
  open: boolean;
  severity: ToastType;
};

const ToastContext = createContext<null | ShowToast>(null);

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

  return (
    <ToastContext.Provider value={showToast}>
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
