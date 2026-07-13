import type { Components, Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

const controlHeight = 36;

export const components: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ ownerState, theme }) => {
        if (ownerState.variant !== 'standard') {
          return {};
        }

        const severityColors = {
          error: theme.palette.error,
          info: theme.palette.info,
          success: theme.palette.success,
          warning: theme.palette.warning,
        } as const;

        const severity = (ownerState.severity ?? 'info') as keyof typeof severityColors;
        const color = severityColors[severity];

        return {
          backgroundColor: alpha(color.main, 0.16),
          color: color.dark,
          ...theme.applyStyles('dark', {
            color: color.light,
          }),
        };
      },
    },
  },

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
        height: controlHeight,
        textTransform: 'none',
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 8,
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

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 10,
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
        color: theme.palette.primary.main,
        height: controlHeight,
      }),
      select: {
        alignItems: 'center',
        display: 'flex',
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
