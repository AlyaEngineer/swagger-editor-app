'use client';

import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { Box, ButtonBase, Tooltip } from '@mui/material';
import { alpha, type SxProps, type Theme, useColorScheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

const SWITCH_SIZE = {
  height: 36,
  icon: 18,
  iconOffset: 8,
  thumb: 28,
  thumbOffset: 3,
  width: 64,
} as const;

const OPACITY = {
  activeIcon: 1,
  border: 0.7,
  darkTrack: 0.16,
  hoverShadow: 0.18,
  hoverTrack: 0.2,
  inactiveIcon: 0.65,
  lightTrack: 0.08,
  thumbShadow: 0.3,
} as const;

const THUMB_SHIFT = SWITCH_SIZE.width - SWITCH_SIZE.thumb - SWITCH_SIZE.thumbOffset * 2;

type ThemeMode = 'dark' | 'light';

const resolveMode = (
  mode: 'system' | ThemeMode,
  systemMode: ThemeMode | undefined,
): ThemeMode | undefined => {
  return mode === 'system' ? systemMode : mode;
};

const getNextMode = (isDarkMode: boolean): ThemeMode => {
  return isDarkMode ? 'light' : 'dark';
};

const getIconStyles = (isActive: boolean, position: 'left' | 'right'): SxProps<Theme> => ({
  color: isActive ? 'primary.contrastText' : 'text.secondary',
  fontSize: SWITCH_SIZE.icon,
  opacity: isActive ? OPACITY.activeIcon : OPACITY.inactiveIcon,
  position: 'absolute',
  [position]: SWITCH_SIZE.iconOffset,
  transition: (theme) =>
    theme.transitions.create(['color', 'opacity'], {
      duration: theme.transitions.duration.short,
    }),
  zIndex: 1,
});

export function ThemeSwitcher() {
  const t = useTranslations('Header');
  const { mode, setMode, systemMode } = useColorScheme();

  if (mode === undefined) {
    return (
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          height: SWITCH_SIZE.height,
          width: SWITCH_SIZE.width,
        }}
      />
    );
  }

  const resolvedMode = resolveMode(mode, systemMode);
  const isDarkMode = resolvedMode === 'dark';

  const label = isDarkMode ? t('switchToLightTheme') : t('switchToDarkTheme');

  const handleToggle = () => {
    setMode(getNextMode(isDarkMode));
  };

  return (
    <Tooltip title={label}>
      <ButtonBase
        aria-checked={isDarkMode}
        aria-label={label}
        focusRipple
        onClick={handleToggle}
        role="switch"
        sx={(theme) => ({
          '&.Mui-focusVisible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, OPACITY.hoverTrack),
            borderColor: theme.palette.primary.main,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, OPACITY.hoverShadow)}`,
          },
          backgroundColor: alpha(
            theme.palette.primary.main,
            isDarkMode ? OPACITY.darkTrack : OPACITY.lightTrack,
          ),
          border: `1px solid ${alpha(theme.palette.primary.main, OPACITY.border)}`,
          borderRadius: theme.shape.borderRadius,
          flexShrink: 0,
          height: SWITCH_SIZE.height,
          overflow: 'hidden',
          position: 'relative',

          transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),

          width: SWITCH_SIZE.width,
        })}
      >
        <Box
          aria-hidden
          sx={(theme) => ({
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, OPACITY.thumbShadow)}`,
            height: SWITCH_SIZE.thumb,
            left: SWITCH_SIZE.thumbOffset,
            position: 'absolute',
            top: SWITCH_SIZE.thumbOffset,
            transform: `translateX(${isDarkMode ? THUMB_SHIFT : 0}px)`,
            transition: theme.transitions.create('transform', {
              duration: theme.transitions.duration.short,
            }),
            width: SWITCH_SIZE.thumb,
          })}
        />

        <LightModeRoundedIcon aria-hidden sx={getIconStyles(!isDarkMode, 'left')} />

        <DarkModeRoundedIcon aria-hidden sx={getIconStyles(isDarkMode, 'right')} />
      </ButtonBase>
    </Tooltip>
  );
}
