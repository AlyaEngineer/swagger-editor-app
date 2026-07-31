import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

export function Examples({ examples }: { examples: string[] }) {
  const t = useTranslations('swaggerViewer');

  if (examples.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.75}>
      <Typography sx={{ fontWeight: 600 }} variant="caption">
        {t('examplesLabel')}
      </Typography>
      {examples.map((example, index) => (
        <Box
          component="pre"
          key={`${example}-${index}`}
          sx={{
            bgcolor: 'action.hover',
            borderRadius: 1,
            fontSize: '0.75rem',
            m: 0,
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
