import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

type CurlCommandPreviewProps = {
  command: string;
  onCopy: () => void;
};

export function CurlCommandPreview({ command, onCopy }: CurlCommandPreviewProps) {
  const t = useTranslations('swaggerViewer');

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography sx={{ fontWeight: 600 }} variant="caption">
            {t('curlCommandLabel')}
          </Typography>
          <Button onClick={onCopy} size="small" type="button" variant="text">
            {t('copyCurlButton')}
          </Button>
        </Stack>
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
          {command}
        </Box>
      </Stack>
    </Paper>
  );
}
