'use client';

import { LanguageSwitcher } from '@components';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import { Link } from '@/i18n/navigation';
import { useScroll } from '@/utils/use-scroll';

import styles from './header.module.scss';

export function Header() {
  const { isAuthenticated, isAuthLoading, signOut } = {
    isAuthenticated: true,
    isAuthLoading: false,
    signOut: () => {},
  }; //useAuth();
  const isCompact = useScroll();

  const headerClassName = isCompact ? `${styles.header} ${styles.headerCompact}` : styles.header;

  return (
    <AppBar className={headerClassName} position="sticky">
      <Toolbar className={styles.toolbar}>
        <Link className={styles.logo} href="/">
          Swagger Editor
        </Link>

        <nav aria-label="Main navigation" className={styles.navigation}>
          <Link className={styles.navLink} href="/about">
            About
          </Link>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />

          {!isAuthLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link className={styles.secondaryButton} href="/history">
                    History
                  </Link>

                  <button className={styles.primaryButton} onClick={signOut} type="button">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link className={styles.secondaryButton} href="/sign-in">
                    Sign In
                  </Link>

                  <Link className={styles.primaryButton} href="/sign-up">
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
