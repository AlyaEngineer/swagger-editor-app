import '../globals.css';

import type { Metadata } from 'next';

import { Header } from '@components';
import { Footer } from '@components';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { appFont, swaggerEditorFont } from '@/fonts';
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
        <InitColorSchemeScript defaultMode="system" />
        <NextIntlClientProvider>
          <MuiProvider>
            <Header />
            {children}
            <Footer />
          </MuiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
