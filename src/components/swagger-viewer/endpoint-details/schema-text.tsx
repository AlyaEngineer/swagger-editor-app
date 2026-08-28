'use client';

import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { EmptyDetails } from '@/components/swagger-viewer/endpoint-details/empty-details';
import { SectionLabel } from '@/components/swagger-viewer/endpoint-details/section-label';

export function SchemaText({ schema }: { schema: string }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Stack spacing={0.25}>
      <SectionLabel>{t('schemaLabel')}</SectionLabel>
      {schema ? (
        <Typography sx={{ fontFamily: 'monospace' }} variant="body2">
          {schema}
        </Typography>
      ) : (
        <EmptyDetails>{t('schemaNotSpecified')}</EmptyDetails>
      )}
    </Stack>
  );
}
