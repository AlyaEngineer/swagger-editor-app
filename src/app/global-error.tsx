'use client';

import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect } from 'react';

import { ErrorCard } from '@/components/error-card/error-card';
import { darkPalette, lightPalette } from '@/theme/palette';

const fallbackTheme = createTheme({
  colorSchemes: {
    dark: { palette: darkPalette },
    light: { palette: lightPalette },
  },
  cssVariables: {
    colorSchemeSelector: 'media',
  },
});

type Props = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultMode="system" noSsr theme={fallbackTheme}>
          <CssBaseline enableColorScheme />
          <ErrorCard
            description="Try refreshing the page or come back later"
            onRetry={unstable_retry}
            retryLabel="Try again"
            title="Something went wrong"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
