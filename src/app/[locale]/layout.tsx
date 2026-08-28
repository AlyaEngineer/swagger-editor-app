import '../globals.css';

import type { Metadata } from 'next';

import { Footer, Header } from '@components';
import { Box } from '@mui/material';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { appFont, swaggerEditorFont } from '@/fonts';
import { AuthProvider } from '@/providers/auth-provider/AuthProvider';
import { MuiProvider } from '@/providers/mui-provider';

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

type Props = MetadataProps &
  Readonly<{
    children: React.ReactNode;
  }>;

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: 'Metadata',
  });

  return {
    description: t('description'),
    title: t('title'),
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <html
      className={`${appFont.variable} ${swaggerEditorFont.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body>
        <InitColorSchemeScript attribute="class" defaultMode="system" />
        <NextIntlClientProvider>
          <MuiProvider>
            <AuthProvider>
              <Header />
              <Box
                component="main"
                sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4, width: '100%' }}
              >
                {children}
              </Box>
              <Footer />
            </AuthProvider>
          </MuiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
