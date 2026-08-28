'use client';

import { useTranslations } from 'next-intl';

import { useToast } from '@/providers/toast-provider/ToastProvider';

export function useCopyToClipboard() {
  const t = useTranslations('toaster');
  const showToast = useToast();

  return async (value: string, successKey: string, errorKey: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(t(successKey), 'success');
    } catch {
      showToast(t(errorKey), 'error');
    }
  };
}
