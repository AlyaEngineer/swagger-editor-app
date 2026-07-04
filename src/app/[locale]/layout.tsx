import '../globals.css';

import type { Metadata } from 'next';

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
    <html className={`${appFont.variable} ${swaggerEditorFont.variable}`} lang={locale}>
      <body>
        <NextIntlClientProvider>
          <MuiProvider>{children}</MuiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
