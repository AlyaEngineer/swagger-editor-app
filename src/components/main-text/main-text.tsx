'use client';

import { Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export const MainText = () => {
  const t = useTranslations('Metadata');

  return (
    <>
      <Typography component="h1" variant="h4">
        {t('title')}
      </Typography>

      <Typography color="text.secondary">{t('description')}</Typography>
    </>
  );
};
