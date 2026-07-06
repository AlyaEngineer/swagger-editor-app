import { createTheme } from '@mui/material/styles';

import { components } from './components';
import { darkPalette, lightPalette } from './palette';
import { typography } from './typography';

export const theme = createTheme({
  colorSchemes: {
    dark: { palette: darkPalette },
    light: { palette: lightPalette },
  },
  components,

  cssVariables: true,

  shape: {
    borderRadius: 50,
  },

  typography,
});
