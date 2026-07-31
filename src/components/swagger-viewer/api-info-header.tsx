'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerViewerApiInfo } from './types';

export function ApiInfoHeader({ apiInfo }: { apiInfo?: null | SwaggerViewerApiInfo }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography component="h2" variant="h5">
          {apiInfo?.title || t('endpointListLabel')}
        </Typography>

        {apiInfo?.version && <Chip label={apiInfo.version} size="small" variant="outlined" />}
      </Stack>

      {apiInfo?.description && (
        <Typography color="text.secondary" variant="body2">
          {apiInfo.description}
        </Typography>
      )}
    </Stack>
  );
}
