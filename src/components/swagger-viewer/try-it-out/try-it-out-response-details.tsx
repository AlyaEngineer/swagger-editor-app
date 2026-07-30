import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

export type TryItOutResponse = {
  body: string;
  durationMs: number;
  headers: Record<string, string>;
  status: number;
  statusText: string;
};

export function TryItOutResponseDetails({ response }: { response: TryItOutResponse }) {
  const t = useTranslations('swaggerViewer');
  const responseHeaders = Object.entries(response.headers);

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            color={response.status >= 400 ? 'error' : 'success'}
            label={`${response.status} ${response.statusText}`}
            size="small"
          />
          <Chip label={`${response.durationMs}ms`} size="small" variant="outlined" />
        </Stack>

        <Typography sx={{ fontWeight: 600 }} variant="caption">
          {t('responseHeadersLabel')}
        </Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: 'action.hover',
            borderRadius: '8px',
            fontSize: '0.75rem',
            m: 0,
            overflow: 'auto',
            p: 1,
            whiteSpace: 'pre-wrap',
          }}
        >
          {responseHeaders.length > 0
            ? responseHeaders.map(([key, value]) => `${key}: ${value}`).join('\n')
            : t('noResponseHeaders')}
        </Box>

        <Typography sx={{ fontWeight: 600 }} variant="caption">
          {t('responseBodyLabel')}
        </Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: 'action.hover',
            borderRadius: '8px',
            fontSize: '0.75rem',
            m: 0,
            overflow: 'auto',
            p: 1,
            whiteSpace: 'pre-wrap',
          }}
        >
          {response.body || t('emptyResponseBody')}
        </Box>
      </Stack>
    </Paper>
  );
}
