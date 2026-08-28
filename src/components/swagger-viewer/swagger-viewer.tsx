'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

import { groupEndpointsByPath } from '@/utils/swagger-editor/group-endpoints-by-path';

import type { SwaggerViewerApiInfo } from './types';

import { ApiInfoHeader } from './api-info-header';
import { PathGroup } from './path-group';

type SwaggerViewerProps = {
  apiInfo?: null | SwaggerViewerApiInfo;
  endpoints: SwaggerEndpoint[];
  isValid: boolean;
};

export function SwaggerViewer({ apiInfo, endpoints, isValid }: SwaggerViewerProps) {
  const t = useTranslations('swaggerViewer');

  if (!isValid) {
    return <Alert severity="info">{t('emptyPrompt')}</Alert>;
  }

  if (endpoints.length === 0) {
    return <Alert severity="warning">{t('noEndpoints')}</Alert>;
  }

  const groupedEndpoints = groupEndpointsByPath(endpoints);

  return (
    <Stack aria-label={t('endpointListLabel')} component="section" spacing={2}>
      <ApiInfoHeader apiInfo={apiInfo} />

      {groupedEndpoints.map(({ endpoints: pathEndpoints, path }) => (
        <PathGroup endpoints={pathEndpoints} key={path} path={path} />
      ))}
    </Stack>
  );
}
