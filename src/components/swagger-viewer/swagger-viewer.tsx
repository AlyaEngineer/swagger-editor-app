'use client';

import type { ChipProps } from '@mui/material/Chip';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

import { getMethodColor } from '@/utils/swagger-editor/get-method-color';
import { groupEndpointsByPath } from '@/utils/swagger-editor/group-endpoints-by-path';

import {
  DetailSection,
  EmptyDetails,
  ParameterDetails,
  RequestBodyDetails,
  ResponseDetails,
} from './endpoint-details';
import { TryItOutPanel } from './try-it-out-panel';

export type SwaggerViewerApiInfo = {
  description: string;
  title: string;
  version: string;
};

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
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography component="h2" variant="h5">
            {apiInfo?.title || t('endpointListLabel')}
          </Typography>
          {apiInfo?.version && <Chip label={apiInfo.version} size="small" variant="outlined" />}
        </Stack>
        {apiInfo?.description && (
          <Typography color="text.secondary" variant="body2">
            {apiInfo.description}
          </Typography>
        )}
      </Stack>

      {groupedEndpoints.map(({ endpoints: pathEndpoints, path }) => (
        <Paper
          component="article"
          key={path}
          sx={{ borderRadius: '8px', overflow: 'hidden' }}
          variant="outlined"
        >
          <Box sx={{ bgcolor: 'action.hover', px: 2, py: 1.5 }}>
            <Typography component="h3" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {path}
            </Typography>
          </Box>

          <Stack divider={<Divider flexItem />} spacing={0}>
            {pathEndpoints.map((endpoint) => (
              <EndpointPanel endpoint={endpoint} key={`${endpoint.method}:${endpoint.path}`} />
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

function EndpointPanel({ endpoint }: { endpoint: SwaggerEndpoint }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Stack spacing={1.5} sx={{ px: 2, py: 1.5 }}>
      <Stack spacing={1} sx={{ minWidth: 0 }}>
        <Chip
          color={getMethodColor(endpoint.method) as ChipProps['color']}
          label={endpoint.method}
          size="small"
          sx={{ minWidth: 78 }}
        />

        <Typography component="h4" sx={{ fontWeight: 700 }} variant="subtitle1">
          {endpoint.summary || t('noSummary')}
        </Typography>
        {endpoint.operationId && (
          <Typography color="text.secondary" variant="caption">
            {t('operationIdLabel')}: {endpoint.operationId}
          </Typography>
        )}
        {endpoint.description && (
          <Typography color="text.secondary" variant="body2">
            {endpoint.description}
          </Typography>
        )}

        <DetailSection title={t('parametersTitle')}>
          {endpoint.parameters.length > 0 ? (
            endpoint.parameters.map((parameter) => (
              <ParameterDetails key={`${parameter.in}:${parameter.name}`} parameter={parameter} />
            ))
          ) : (
            <EmptyDetails>{t('noParameters')}</EmptyDetails>
          )}
        </DetailSection>

        <DetailSection title={t('requestBodyTitle')}>
          {endpoint.requestBody ? (
            <RequestBodyDetails requestBody={endpoint.requestBody} />
          ) : (
            <EmptyDetails>{t('noRequestBody')}</EmptyDetails>
          )}
        </DetailSection>

        <DetailSection title={t('responsesTitle')}>
          {endpoint.responses.length > 0 ? (
            endpoint.responses.map((response) => (
              <ResponseDetails key={response.statusCode} response={response} />
            ))
          ) : (
            <EmptyDetails>{t('noResponses')}</EmptyDetails>
          )}
        </DetailSection>

        <TryItOutPanel endpoint={endpoint} />
      </Stack>
    </Stack>
  );
}
