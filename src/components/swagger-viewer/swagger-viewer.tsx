'use client';

import Alert from '@mui/material/Alert';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

type SwaggerViewerProps = {
  endpoints: SwaggerEndpoint[];
  isValid: boolean;
};

// TODO: заменить на реальную реализацию Swagger Viewer
export function SwaggerViewer({ endpoints, isValid }: SwaggerViewerProps) {
  const t = useTranslations('swaggerViewer');

  if (!isValid) {
    return <Alert severity="info">{t('emptyPrompt')}</Alert>;
  }

  if (endpoints.length === 0) {
    return <Alert severity="warning">{t('noEndpoints')}</Alert>;
  }

  return <Alert severity="success">{t('placeholder', { count: endpoints.length })}</Alert>;
}
