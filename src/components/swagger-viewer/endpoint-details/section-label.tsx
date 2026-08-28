import type { ReactNode } from 'react';

import Typography from '@mui/material/Typography';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      color="text.secondary"
      component="div"
      sx={{ fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}
      variant="caption"
    >
      {children}
    </Typography>
  );
}
