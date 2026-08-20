import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import { SectionLabel } from './section-label';

type ExamplesProps = {
  examples: string[];
  generatedExample?: string;
};

export function Examples({ examples, generatedExample = '' }: ExamplesProps) {
  const t = useTranslations('swaggerViewer');
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
