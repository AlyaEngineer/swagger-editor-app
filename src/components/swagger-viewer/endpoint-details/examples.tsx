import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import { SectionLabel } from './section-label';

export function Examples({ examples }: { examples: string[] }) {
  const t = useTranslations('swaggerViewer');

  if (examples.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.75}>
      <SectionLabel>{t('examplesLabel')}</SectionLabel>
      {examples.map((example, index) => (
        <Box
          component="pre"
          key={`${example}-${index}`}
          sx={{
            bgcolor: 'action.hover',
            borderRadius: 0.1,
            fontSize: '0.75rem',
            m: 0,
            maxHeight: 320,
            overflow: 'auto',
            p: 1,
            whiteSpace: 'pre-wrap',
          }}
        >
          {example}
        </Box>
      ))}
    </Stack>
  );
}
