import './globals.scss';

import type { Metadata } from 'next';

import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

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
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
