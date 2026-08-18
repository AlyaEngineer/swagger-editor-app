import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { SectionLabel } from './section-label';

export function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Box>
      <SectionLabel>{title}</SectionLabel>
      <Stack spacing={1} sx={{ mt: 0.75 }}>
        {children}
      </Stack>
    </Box>
  );
}
