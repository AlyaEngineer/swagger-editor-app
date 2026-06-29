import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  components: {
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
