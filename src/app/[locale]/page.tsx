import { getTranslations } from 'next-intl/server';

import { Header } from '@/components';

export default async function Home() {
  const t = await getTranslations();

  return (
    <>
      <Header />
      <div>{t('check')}</div>
    </>
  );
}
