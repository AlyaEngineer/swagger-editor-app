'use client';

import type { ChipProps } from '@mui/material/Chip';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

import { getMethodColor } from '@/utils/swagger-editor/get-method-color';

export function EndpointSummaryRow({ endpoint }: { endpoint: SwaggerEndpoint }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Chip
        color={getMethodColor(endpoint.method) as ChipProps['color']}
        label={endpoint.method}
        size="small"
        sx={{ minWidth: 72 }}
      />

      <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
        {endpoint.summary || t('noSummary')}
      </Typography>
    </Stack>
  );
}
