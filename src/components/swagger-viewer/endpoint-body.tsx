'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type {
  SwaggerEndpoint,
  SwaggerMediaType,
} from '@/utils/swagger-editor/get-swagger-endpoints';

import { MarkdownText } from '@/components/markdown-text/markdown-text';

import {
  DetailSection,
  EmptyDetails,
  ParameterDetails,
  RequestBodyDetails,
  ResponseDetails,
} from './endpoint-details';
import { TryItOutPanel } from './try-it-out';

const DEFAULT_CONTENT_TYPE = 'application/json';

export function EndpointBody({ endpoint }: { endpoint: SwaggerEndpoint }) {
  const t = useTranslations('swaggerViewer');
  const mediaTypes = endpoint.requestBody?.mediaTypes ?? [];
  const [contentType, setContentType] = useState(getInitialContentType(mediaTypes));

  return (
    <Stack spacing={1.5}>
      {endpoint.operationId && (
        <Typography color="text.secondary" variant="caption">
          {t('operationIdLabel')}: {endpoint.operationId}
        </Typography>
      )}
      {endpoint.description && <MarkdownText>{endpoint.description}</MarkdownText>}

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
          <RequestBodyDetails
            contentType={contentType}
            onContentTypeChange={setContentType}
            requestBody={endpoint.requestBody}
          />
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

      <TryItOutPanel contentType={contentType} endpoint={endpoint} />
    </Stack>
  );
}

function getInitialContentType(mediaTypes: SwaggerMediaType[]) {
  const hasJson = mediaTypes.some((mediaType) => mediaType.contentType === DEFAULT_CONTENT_TYPE);

  return hasJson ? DEFAULT_CONTENT_TYPE : (mediaTypes[0]?.contentType ?? '');
}
