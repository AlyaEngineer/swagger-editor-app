'use client';

import { Alert, Grow, GrowProps, Snackbar } from '@mui/material';

import { ToastType } from './types';

type ToastProps = {
  message: string;
  onClose: () => void;
  open: boolean;
  severity: ToastType;
};

export function Toast({ message, onClose, open, severity }: ToastProps) {
  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      autoHideDuration={5000}
      onClose={onClose}
      open={open}
      slots={{ transition: GrowTransition }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}

function GrowTransition(props: GrowProps) {
  return <Grow {...props} />;
}
