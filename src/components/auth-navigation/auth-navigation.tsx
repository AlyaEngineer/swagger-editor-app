'use client';

import { AppLinkButton } from '../app-link/app-link';

export const AuthNavigation = () => {
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
          <AppLinkButton href="/history">History</AppLinkButton>

          <AppLinkButton onClick={signOut} variant="contained">
            Sign Out
          </AppLinkButton>
        </>
      ) : (
        <>
          <AppLinkButton href="/sign-in" variant="outlined">
            Sign In
          </AppLinkButton>

          <AppLinkButton href="/sign-up" variant="contained">
            Sign Up
          </AppLinkButton>
        </>
      )}
    </>
  );
};
