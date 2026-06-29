'use client';

import { AppLink } from '../app-link/app-link';

export const AuthNavigation = () => {
  const { isAuthenticated, isAuthLoading, signOut } = {
    isAuthenticated: false,
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
          <AppLink href="/history" variant="outlined">
            History
          </AppLink>

          <AppLink onClick={signOut} variant="contained">
            Sign Out
          </AppLink>
        </>
      ) : (
        <>
          <AppLink href="/sign-in" variant="outlined">
            Sign In
          </AppLink>

          <AppLink href="/sign-up" variant="contained">
            Sign Up
          </AppLink>
        </>
      )}
    </>
  );
};
