'use client';

import { useTranslations } from 'next-intl';

import { AppLinkButton } from '../app-link/app-link';

export const AuthNavigation = () => {
  const t = useTranslations('Header');

  const { isAuthenticated, isAuthLoading, signOut } = {
    isAuthenticated: true,
    isAuthLoading: false,
    signOut: () => {},
  }; //useAuth();

  if (isAuthLoading) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <AppLinkButton href="/history">{t('history')}</AppLinkButton>

          <AppLinkButton onClick={signOut} variant="contained">
            {t('signOut')}
          </AppLinkButton>
        </>
      ) : (
        <>
          <AppLinkButton href="/sign-in" variant="outlined">
            {t('signIn')}
          </AppLinkButton>

          <AppLinkButton href="/sign-up" variant="contained">
            {t('signUp')}
          </AppLinkButton>
        </>
      )}
    </>
  );
};
