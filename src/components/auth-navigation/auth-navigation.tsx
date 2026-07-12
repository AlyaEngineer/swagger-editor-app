'use client';

import { useTranslations } from 'next-intl';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/auth-provider/AuthProvider';
import { useToast } from '@/providers/toast-provider/ToastProvider';

import { AppLinkButton } from '../app-link/app-link';

export const AuthNavigation = () => {
  const t = useTranslations('Header');
  const tToast = useTranslations('toaster');
  const showToast = useToast();

  const { isAuthenticated, isAuthLoading, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      showToast(tToast('signOutError'), 'error');
    }
  }

  if (isAuthLoading) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <AppLinkButton href={ROUTES.history}>{t('history')}</AppLinkButton>

          <AppLinkButton onClick={handleSignOut} variant="contained">
            {t('signOut')}
          </AppLinkButton>
        </>
      ) : (
        <>
          <AppLinkButton href={ROUTES.signIn} variant="outlined">
            {t('signIn')}
          </AppLinkButton>

          <AppLinkButton href={ROUTES.signUp} variant="contained">
            {t('signUp')}
          </AppLinkButton>
        </>
      )}
    </>
  );
};
