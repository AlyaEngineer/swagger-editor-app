'use client';

import { LanguageSwitcher } from '@components';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import { Link } from '@/i18n/navigation';
import { useScroll } from '@/utils/use-scroll';

import { AuthNavigation } from '../auth-navigation/auth-navigation';
import styles from './header.module.css';

export function Header() {
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

          <div className={styles.actions}>
            <LanguageSwitcher />

            <AuthNavigation />
          </div>
        </nav>
      </Toolbar>
    </AppBar>
  );
}
