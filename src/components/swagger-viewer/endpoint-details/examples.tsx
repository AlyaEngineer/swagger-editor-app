'use client';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import { SectionLabel } from './section-label';

type ExamplesProps = {
  examples: string[];
  generatedExample?: string;
};

export function Examples({ examples, generatedExample = '' }: ExamplesProps) {
  const t = useTranslations('swaggerViewer');
  const copyToClipboard = useCopyToClipboard();
  const hasOwnExamples = examples.length > 0;
  const items = hasOwnExamples ? examples : generatedExample ? [generatedExample] : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.75}>
      <SectionLabel>
        {hasOwnExamples ? t('examplesLabel') : t('generatedExampleLabel')}
      </SectionLabel>
      {items.map((example, index) => (
        <Box key={`${example}-${index}`} sx={{ position: 'relative' }}>
          <IconButton
            aria-label={t('copyExampleButton')}
            onClick={() => copyToClipboard(example, 'exampleCopySuccess', 'exampleCopyError')}
            size="small"
            sx={{ borderRadius: 0.1, position: 'absolute', right: 4, top: 4 }}
          >
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
          <Box
            component="pre"
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 0.1,
              fontSize: '0.75rem',
              m: 0,
              maxHeight: 320,
              overflow: 'auto',
              p: 1,
              pr: 5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {example}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
