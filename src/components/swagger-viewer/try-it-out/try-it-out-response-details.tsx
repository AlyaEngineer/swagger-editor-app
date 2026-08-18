import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import { SectionLabel } from '../endpoint-details';

export type TryItOutResponse = {
  body: string;
  durationMs: number;
  headers: Record<string, string>;
  status: number;
  statusText: string;
};

const preStyles = {
  bgcolor: 'action.hover',
  borderRadius: 0.1,
  fontSize: '0.75rem',
  m: 0,
  maxHeight: 400,
  overflow: 'auto',
  p: 1,
  whiteSpace: 'pre-wrap',
} as const;

export function TryItOutResponseDetails({ response }: { response: TryItOutResponse }) {
  const t = useTranslations('swaggerViewer');
  const responseHeaders = Object.entries(response.headers);

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            color={response.status >= 400 ? 'error' : 'success'}
            label={`${response.status} ${response.statusText}`}
            size="small"
          />
          <Chip label={`${response.durationMs}ms`} size="small" variant="outlined" />
        </Stack>

        <Stack spacing={0.75}>
          <SectionLabel>{t('responseBodyLabel')}</SectionLabel>
          <Box component="pre" sx={preStyles}>
            {response.body
              ? formatBody(response.body, response.headers['content-type'] ?? '')
              : t('emptyResponseBody')}
          </Box>
        </Stack>

        <Stack spacing={0.75}>
          <SectionLabel>{t('responseHeadersLabel')}</SectionLabel>
          <Box component="pre" sx={{ ...preStyles, maxHeight: 240 }}>
            {responseHeaders.length > 0
              ? responseHeaders.map(([key, value]) => `${key}: ${value}`).join('\n')
              : t('noResponseHeaders')}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}

function formatBody(body: string, contentType: string) {
  if (!contentType.includes('json')) {
    return body;
  }

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}
