'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

import {
  DetailSection,
  EmptyDetails,
  ParameterDetails,
  RequestBodyDetails,
  ResponseDetails,
} from './endpoint-details';
import { TryItOutPanel } from './try-it-out';

export function EndpointBody({ endpoint }: { endpoint: SwaggerEndpoint }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Stack spacing={1.5}>
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
  );
}
