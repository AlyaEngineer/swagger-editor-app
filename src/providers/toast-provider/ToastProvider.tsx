'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { Toast } from './Toast';
import { ToastType } from './types';

type ShowToast = (message: string, severity?: ToastType) => void;

const ToastContext = createContext<null | ShowToast>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<ToastType>('success');

  const showToast = useCallback((newMessage: string, newSeverity: ToastType = 'success') => {
    setMessage(newMessage);
    setSeverity(newSeverity);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      <Toast message={message} onClose={handleClose} open={open} severity={severity} />
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
