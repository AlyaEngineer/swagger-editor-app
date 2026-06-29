'use client';

import { AppBar, Box, Toolbar, useScrollTrigger } from '@mui/material';

import { AppLink, AuthNavigation, LanguageSwitcher } from '@/components';

const flex = {
  alignItems: 'center',
  display: 'flex',
  gap: 1.5,
};

export function Header() {
  const isCompact = useScrollTrigger({
    disableHysteresis: true,
    threshold: 32,
  });

  return (
    <AppBar elevation={0} position="sticky">
      <Toolbar
        sx={{
          minHeight: {
            sm: isCompact ? 52 : 64,
          },
          py: isCompact ? 0.5 : 1.25,
          transition: (theme) =>
            theme.transitions.create(['min-height', 'padding'], {
              duration: theme.transitions.duration.short,
            }),
        }}
      >
        <Box sx={flex}>
          <AppLink href="/">Swagger Editor</AppLink>

          <LanguageSwitcher />
        </Box>

        <Box
          aria-label="Main navigation"
          component="nav"
          sx={{
            ...flex,
            ml: 'auto',
          }}
        >
          <AppLink href="/about">About</AppLink>

          <AuthNavigation />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
