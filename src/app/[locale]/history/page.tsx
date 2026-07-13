import { Alert } from '@mui/material';
import { getTranslations } from 'next-intl/server';

import { HistoryEmptyState } from '@/components/history-empty-state/history-empty-state';
import { HistoryList } from '@/components/history-list/history-list';
import { getAuthenticatedUser } from '@/utils/auth/get-authenticated-user';
import { getRequestHistory } from '@/utils/history/get-request-history';

export default async function HistoryPage() {
  await getAuthenticatedUser();

  const { entries, hasError } = await getRequestHistory();
  const t = await getTranslations('HistoryPage');
  const tToast = await getTranslations('toaster');

  return (
    <div>
      <h1>{t('title')}</h1>

      {hasError && <Alert severity="error">{tToast('historyLoadError')}</Alert>}

      {!hasError && entries.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <HistoryList entries={entries} />
      )}
    </div>
  );
}
