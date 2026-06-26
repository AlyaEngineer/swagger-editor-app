import { Header } from '@components';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations();

  return (
    <>
      <Header />
      <div>{t('check')}</div>
    </>
  );
}
