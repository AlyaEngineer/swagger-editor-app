import { Header } from '@components';
import { getTranslations } from 'next-intl/server';

import { Footer } from '@/components/footer/footer';

export default async function Home() {
  const t = await getTranslations();

  return (
    <>
      <Header />
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>
      <div>{t('check')}</div>

      <Footer />
    </>
  );
}
