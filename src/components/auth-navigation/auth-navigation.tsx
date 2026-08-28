'use client';

import Divider from '@mui/material/Divider';
import { useTranslations } from 'next-intl';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/auth-provider/AuthProvider';
import { useToast } from '@/providers/toast-provider/ToastProvider';

import { AppLinkButton } from '../app-link/app-link';

type AuthNavigationProps = {
  isCompact?: boolean;
};

export const AuthNavigation = ({ isCompact = false }: AuthNavigationProps) => {
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

          {isCompact && <Divider sx={{ my: 1 }} />}

          <AppLinkButton onClick={handleSignOut} variant="text">
            {t('signOut')}
          </AppLinkButton>
        </>
      ) : (
        <>
          {isCompact && <Divider sx={{ my: 1 }} />}

          <AppLinkButton href={ROUTES.signIn} variant={isCompact ? 'text' : 'outlined'}>
            {t('signIn')}
          </AppLinkButton>

          <AppLinkButton href={ROUTES.signUp} variant={isCompact ? 'text' : 'contained'}>
            {t('signUp')}
          </AppLinkButton>
        </>
      )}
    </>
  );
};
