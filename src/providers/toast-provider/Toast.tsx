'use client';

import { Alert, Grow, GrowProps, Snackbar, SnackbarCloseReason } from '@mui/material';

import { ToastType } from './types';

type ToastProps = {
  message: string;
  onClose: () => void;
  open: boolean;
  severity: ToastType;
};

export function Toast({ message, onClose, open, severity }: ToastProps) {
  const handleClose = (_event: Event | React.SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason !== 'clickaway') onClose();
  };

  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      autoHideDuration={5000}
      onClose={handleClose}
      open={open}
      slots={{ transition: GrowTransition }}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}

function GrowTransition(props: GrowProps) {
  return <Grow {...props} />;
}
