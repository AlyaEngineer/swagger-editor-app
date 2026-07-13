import { Alert, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { AppLinkButton } from '@/components/app-link/app-link';
import { ROUTES } from '@/constants/routes';

export function HistoryEmptyState() {
  const t = useTranslations('HistoryPage');

  return (
    <Stack spacing={6}>
      <Alert severity="info">{t('emptyMessage')}</Alert>

      <Stack direction="column" spacing={2}>
        <Typography color="text.secondary">{t('emptyLinksHint')}</Typography>
        <AppLinkButton href={ROUTES.home} sx={{ alignSelf: 'flex-start' }} variant="outlined">
          {t('goToEditor')}
        </AppLinkButton>
      </Stack>
    </Stack>
  );
}
