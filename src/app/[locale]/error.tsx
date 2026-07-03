'use client';

import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

const ErrorContainer = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  justifyContent: 'center',
  minHeight: '100dvh',
  padding: theme.spacing(2),
}));

const ErrorCard = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  maxWidth: '450px',
  padding: theme.spacing(4),
  textAlign: 'center',
  width: '100%',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = useTranslations('errorPage');

  return (
    <ErrorContainer>
      <ErrorCard sx={{ backgroundColor: 'background.paper', borderRadius: 1 }}>
        <Typography component="h1" variant="h4">
          {t('title')}
        </Typography>

        <Typography color="text.secondary">{t('description')}</Typography>

        <Button onClick={() => unstable_retry()} variant="contained">
          {t('retry')}
        </Button>
      </ErrorCard>
    </ErrorContainer>
  );
}
