import { createTheme } from '@mui/material/styles';

const controlHeight = 36;

export const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)',
          borderBottom: '1px solid rgba(124, 58, 237, 0.16)',
          boxShadow:
            '0 1px 0 rgba(124, 58, 237, 0.14), 0 14px 36px rgba(124, 58, 237, 0.14), 0 32px 70px rgba(124, 58, 237, 0.10)',
          color: '#211536',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        contained: {
          '&:hover': {
            boxShadow: '2px 8px 22px rgba(159, 107, 248, 0.32)',
          },
        },

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
  },

  palette: {
    primary: {
      main: '#7c3aed',
    },
  },

  shape: {
    borderRadius: 50,
  },
});
