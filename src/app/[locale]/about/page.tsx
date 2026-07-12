import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { AboutPageContent } from '@/components/about/about-page-content';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AboutPage' });

  return <AboutPageContent t={t} />;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AboutPage' });

  return {
    description: t('metadata.description'),
    title: t('metadata.title'),
  };
}
