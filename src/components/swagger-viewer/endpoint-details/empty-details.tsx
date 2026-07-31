import type { ReactNode } from 'react';

import Typography from '@mui/material/Typography';

export function EmptyDetails({ children }: { children: ReactNode }) {
  return (
    <Typography color="text.secondary" variant="body2">
      {children}
    </Typography>
  );
}
