'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

type SwaggerViewerProps = {
  endpoints: SwaggerEndpoint[];
  isValid: boolean;
};

export function SwaggerViewer({ endpoints, isValid }: SwaggerViewerProps) {
  const t = useTranslations('swaggerViewer');

  if (!isValid) {
    return <Alert severity="info">{t('emptyPrompt')}</Alert>;
  }

  if (endpoints.length === 0) {
    return <Alert severity="warning">{t('noEndpoints')}</Alert>;
  }

  return (
    <Stack spacing={2}>
      {endpoints.map((endpoint) => (
        <Paper
          key={`${endpoint.method}-${endpoint.path}`}
          sx={{
            p: 2,
          }}
          variant="outlined"
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Chip
              color="primary"
              label={endpoint.method}
              size="small"
              sx={{
                minWidth: 72,
              }}
            />

            <Box>
              <Typography sx={{ fontWeight: 700 }}>{endpoint.path}</Typography>
              <Typography color="text.secondary" variant="body2">
                {endpoint.summary}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
