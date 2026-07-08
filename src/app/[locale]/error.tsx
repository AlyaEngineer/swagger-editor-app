'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { ErrorCard } from '@/components/error-card/error-card';

type Props = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorPage({ error, unstable_retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = useTranslations('errorPage');

  return (
    <ErrorCard
      description={t('description')}
      onRetry={() => unstable_retry()}
      retryLabel={t('retry')}
      title={t('title')}
    />
  );
}
