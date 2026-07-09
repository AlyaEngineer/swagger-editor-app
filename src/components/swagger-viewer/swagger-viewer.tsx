'use client';

import type { ChipProps } from '@mui/material/Chip';
import type { ReactNode } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type {
  SwaggerEndpoint,
  SwaggerEndpointParameter,
  SwaggerEndpointRequestBody,
  SwaggerEndpointResponse,
} from '@/utils/swagger-editor/get-swagger-endpoints';

import { getMethodColor } from '@/utils/swagger-editor/get-method-color';
import { groupEndpointsByPath } from '@/utils/swagger-editor/group-endpoints-by-path';

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
              <Stack
                key={`${endpoint.method}:${endpoint.path}`}
                spacing={1}
                sx={{
                  alignItems: { sm: 'center', xs: 'flex-start' },
                  flexDirection: { sm: 'row', xs: 'column' },
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                }}
              >
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
                        <ParameterDetails
                          key={`${parameter.in}:${parameter.name}`}
                          parameter={parameter}
                        />
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
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

function ContentTypes({ contentTypes }: { contentTypes: string[] }) {
  if (contentTypes.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {contentTypes.map((contentType) => (
        <Chip key={contentType} label={contentType} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, mb: 1 }} variant="body2">
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

function EmptyDetails({ children }: { children: ReactNode }) {
  return (
    <Typography color="text.secondary" variant="body2">
      {children}
    </Typography>
  );
}

function Examples({ examples }: { examples: string[] }) {
  const t = useTranslations('swaggerViewer');

  if (examples.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.75}>
      <Typography sx={{ fontWeight: 600 }} variant="caption">
        {t('examplesLabel')}
      </Typography>
      {examples.map((example, index) => (
        <Box
          component="pre"
          key={`${example}-${index}`}
          sx={{
            bgcolor: 'action.hover',
            borderRadius: 1,
            fontSize: '0.75rem',
            m: 0,
            overflow: 'auto',
            p: 1,
            whiteSpace: 'pre-wrap',
          }}
        >
          {example}
        </Box>
      ))}
    </Stack>
  );
}

function ParameterDetails({ parameter }: { parameter: SwaggerEndpointParameter }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={parameter.in} size="small" />
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }} variant="body2">
            {parameter.name}
          </Typography>
          <Chip
            color={parameter.required ? 'error' : 'default'}
            label={parameter.required ? t('requiredLabel') : t('optionalLabel')}
            size="small"
            variant="outlined"
          />
        </Stack>
        {parameter.description && (
          <Typography color="text.secondary" variant="body2">
            {parameter.description}
          </Typography>
        )}
        <SchemaText schema={parameter.schema} />
      </Stack>
    </Paper>
  );
}

function RequestBodyDetails({ requestBody }: { requestBody: SwaggerEndpointRequestBody }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            color={requestBody.required ? 'error' : 'default'}
            label={requestBody.required ? t('requiredLabel') : t('optionalLabel')}
            size="small"
            variant="outlined"
          />
          <ContentTypes contentTypes={requestBody.contentTypes} />
        </Stack>
        {requestBody.description && (
          <Typography color="text.secondary" variant="body2">
            {requestBody.description}
          </Typography>
        )}
        <SchemaText schema={requestBody.schema} />
        <Examples examples={requestBody.examples} />
      </Stack>
    </Paper>
  );
}

function ResponseDetails({ response }: { response: SwaggerEndpointResponse }) {
  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip color="primary" label={response.statusCode} size="small" variant="outlined" />
          <ContentTypes contentTypes={response.contentTypes} />
        </Stack>
        {response.description && (
          <Typography color="text.secondary" variant="body2">
            {response.description}
          </Typography>
        )}
        <SchemaText schema={response.schema} />
        <Examples examples={response.examples} />
      </Stack>
    </Paper>
  );
}

function SchemaText({ schema }: { schema: string }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Typography color="text.secondary" variant="body2">
      {t('schemaLabel')}: {schema || t('schemaNotSpecified')}
    </Typography>
  );
}
