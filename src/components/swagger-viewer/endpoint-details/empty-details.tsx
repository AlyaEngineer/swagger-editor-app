import type { ReactNode } from 'react';

import Typography from '@mui/material/Typography';

export function EmptyDetails({ children }: { children: ReactNode }) {
  return (
    <Typography
      color="text.disabled"
      sx={{ fontSize: '0.875rem', fontStyle: 'italic' }}
      variant="body2"
    >
      {children}
    </Typography>
  );
}
