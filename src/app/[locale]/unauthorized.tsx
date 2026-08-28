'use client';

import { Backdrop, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useRouter } from '@/i18n/navigation';

export default function Unauthorized() {
  const router = useRouter();
  const t = useTranslations('errorPage');

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <Backdrop
      open
      sx={{
        color: (theme) => theme.palette.common.white,
        flexDirection: 'column',
        gap: 3,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <CircularProgress color="inherit" size={48} />
      <Typography variant="h5">{t('redirecting')}</Typography>
    </Backdrop>
  );
}
