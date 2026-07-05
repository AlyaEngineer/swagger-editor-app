import type { Components, Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

const controlHeight = 36;

export const components: Components<Theme> = {
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }) => ({
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.16)} 0%, ${alpha(theme.palette.primary.main, 0.12)} 50%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        boxShadow: `0 16px 24px ${alpha(theme.palette.primary.main, 0.18)}, 0 20px 48px ${alpha(theme.palette.primary.main, 0.12)}`,
      }),
    },
  },

  MuiButton: {
    styleOverrides: {
      contained: ({ theme }) => ({
        '&:hover': {
          boxShadow: `2px 8px 22px ${alpha(theme.palette.primary.main, 0.32)}`,
        },
      }),
      root: {
        textTransform: 'none',
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        minHeight: 36,
      },
    },
  },

  MuiSelect: {
    styleOverrides: {
      icon: ({ theme }) => ({
        color: theme.palette.primary.main,
      }),
      root: ({ theme }) => ({
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.dark,
        },
        borderRadius: theme.shape.borderRadius,
        height: controlHeight,
      }),
      select: {
        alignItems: 'center',
        display: 'flex',
        height: controlHeight,
        minHeight: 'unset',
        paddingBottom: 0,
        paddingTop: 0,
      },
    },
  },

  MuiToolbar: {
    styleOverrides: {
      root: {
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '16px',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '1200px',
        width: '100%',
      },
    },
  },
};
