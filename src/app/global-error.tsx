'use client';

import { Box, Button, CssBaseline, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const fallbackTheme = createTheme({
  colorSchemes: {
    dark: true,
    light: true,
  },
  cssVariables: {
    colorSchemeSelector: 'media',
  },
});

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultMode="system" noSsr theme={fallbackTheme}>
          <CssBaseline enableColorScheme />
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: 'background.default',
              color: 'text.primary',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              justifyContent: 'center',
              minHeight: '100vh',
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography color="error" variant="h4">
              Something went wrong
            </Typography>
            <Typography color="text.secondary">
              Try refreshing the page or come back later
            </Typography>
            <Button color="error" onClick={unstable_retry} variant="contained">
              Try again
            </Button>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
