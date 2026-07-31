import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, mb: 1 }} variant="body2">
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}
