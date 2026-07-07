'use client';

import { AppBar, Box, Toolbar, useScrollTrigger } from '@mui/material';
import { useTranslations } from 'next-intl';

import { AppLinkButton, AuthNavigation, LanguageSwitcher } from '@/components';
import { BRAND_NAME } from '@/constants/brand';
import { ROUTES } from '@/constants/routes';

const STICKY_SCROLL_OFFSET = 32;

const HEADER_SIZES = {
  compact: { minHeight: 52, py: 0.5 },
  expanded: { minHeight: 64, py: 1.25 },
};

const flex = {
  alignItems: 'center',
  display: 'flex',
  gap: 1.5,
};

export function Header() {
  const t = useTranslations('Header');
  const isCompact = useScrollTrigger({
    disableHysteresis: true,
    threshold: STICKY_SCROLL_OFFSET,
  });

  const { minHeight, py } = isCompact ? HEADER_SIZES.compact : HEADER_SIZES.expanded;

  return (
    <AppBar
      elevation={0}
      position="sticky"
      sx={{
        backgroundColor: 'background.paper',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        style={{
          minHeight,
          transition: 'min-height 200ms',
        }}
        sx={{
          py,
          transition: (theme) =>
            theme.transitions.create(['padding'], {
              duration: theme.transitions.duration.short,
            }),
        }}
      >
        <AppLinkButton href={ROUTES.home}>{BRAND_NAME}</AppLinkButton>

        <Box
          aria-label="Main navigation"
          component="nav"
          sx={{
            ...flex,
            ml: 'auto',
          }}
        >
          <AppLinkButton href={ROUTES.about}>{t('about')}</AppLinkButton>

          <AuthNavigation />

          <LanguageSwitcher />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
