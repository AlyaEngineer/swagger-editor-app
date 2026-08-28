'use client';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Divider } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AppLinkButton, AuthNavigation, LanguageSwitcher, ThemeSwitcher } from '@/components';
import { BRAND_NAME } from '@/constants/brand';
import { ROUTES } from '@/constants/routes';

export function MobileNavigation() {
  const t = useTranslations('Header');
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (isDesktop && isOpen) {
    setIsOpen(false);
  }

  return (
    <>
      <IconButton aria-label={t('openMenu')} onClick={() => setIsOpen(true)} sx={{ ml: 'auto' }}>
        <MenuIcon />
      </IconButton>

      <Drawer anchor="right" onClose={() => setIsOpen(false)} open={isOpen}>
        <Stack sx={{ height: '100%', width: 260 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              variant="h6"
            >
              {BRAND_NAME}
            </Typography>
            <IconButton aria-label={t('closeMenu')} onClick={() => setIsOpen(false)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider />

          <Stack
            aria-label={t('navigationLabel')}
            component="nav"
            onClick={() => setIsOpen(false)}
            sx={{
              '& .MuiButton-root': {
                borderRadius: 0,
                fontSize: '1rem',
                justifyContent: 'flex-start',
                minHeight: 48,
                px: 2,
                py: 1.25,
              },
              py: 1,
            }}
          >
            <AppLinkButton href={ROUTES.home}>{t('main')}</AppLinkButton>
            <AppLinkButton href={ROUTES.about}>{t('about')}</AppLinkButton>
            <AuthNavigation isCompact />
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{ bgcolor: 'action.hover', justifyContent: 'center', p: 1.5 }}
          >
            <ThemeSwitcher />
            <LanguageSwitcher />
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
