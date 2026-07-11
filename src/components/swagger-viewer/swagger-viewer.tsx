'use client';

import type { ChipProps } from '@mui/material/Chip';
import type { FormEvent, ReactNode } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type {
  SwaggerEndpoint,
  SwaggerEndpointParameter,
  SwaggerEndpointRequestBody,
  SwaggerEndpointResponse,
} from '@/utils/swagger-editor/get-swagger-endpoints';

import { useToast } from '@/providers/toast-provider/ToastProvider';
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

type TryItOutResponse = {
  body: string;
  durationMs: number;
  headers: Record<string, string>;
  status: number;
  statusText: string;
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

function applyPathParameters(
  path: string,
  parameters: SwaggerEndpointParameter[],
  parameterValues: Record<string, string>,
) {
  return parameters
    .filter((parameter) => parameter.in === 'path')
    .reduce((currentPath, parameter) => {
      const value = parameterValues[getParameterKey(parameter)] ?? '';

      return currentPath.replaceAll(`{${parameter.name}}`, encodeURIComponent(value));
    }, path);
}

function buildCurlCommand(request: NonNullable<ReturnType<typeof buildTryItOutRequest>>) {
  const parts = ['curl', '-X', request.method, shellQuote(request.url)];

  for (const [key, value] of Object.entries(request.headers)) {
    parts.push('-H', shellQuote(`${key}: ${value}`));
  }

  if (request.body) {
    parts.push('--data-raw', shellQuote(request.body));
  }

  return parts.join(' ');
}

function buildTryItOutRequest(
  endpoint: SwaggerEndpoint,
  serverUrl: string,
  parameterValues: Record<string, string>,
  body: string,
) {
  try {
    const url = new URL(
      joinUrl(serverUrl, applyPathParameters(endpoint.path, endpoint.parameters, parameterValues)),
    );
    const headers: Record<string, string> = {};
    const cookieValues: string[] = [];

    for (const parameter of endpoint.parameters) {
      const value = parameterValues[getParameterKey(parameter)] ?? '';

      if (!value) {
        continue;
      }

      if (parameter.in === 'query') {
        url.searchParams.set(parameter.name, value);
      }

      if (parameter.in === 'header') {
        headers[parameter.name] = value;
      }

      if (parameter.in === 'cookie') {
        cookieValues.push(`${parameter.name}=${value}`);
      }
    }

    if (cookieValues.length > 0) {
      headers.Cookie = cookieValues.join('; ');
    }

    if (endpoint.requestBody?.contentTypes[0]) {
      headers['Content-Type'] = endpoint.requestBody.contentTypes[0];
    }

    return {
      body,
      headers,
      method: endpoint.method,
      url: url.toString(),
    };
  } catch {
    return null;
  }
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

function getParameterKey(parameter: SwaggerEndpointParameter) {
  return `${parameter.in}:${parameter.name}`;
}

function getTryItOutErrorKey(errorCode: unknown) {
  switch (errorCode) {
    case 'blockedUrl':
      return 'tryItOutBlockedUrl';
    case 'invalidPayload':
      return 'tryItOutInvalidPayload';
    case 'invalidUrl':
      return 'tryItOutInvalidUrl';
    case 'timeout':
      return 'tryItOutTimeout';
    default:
      return 'tryItOutFailed';
  }
}

function joinUrl(serverUrl: string, path: string) {
  return `${serverUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
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

function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function TryItOutPanel({ endpoint }: { endpoint: SwaggerEndpoint }) {
  const t = useTranslations('swaggerViewer');
  const tToast = useTranslations('toaster');
  const showToast = useToast();
  const [body, setBody] = useState(endpoint.requestBody?.examples[0] ?? '');
  const [curlCommand, setCurlCommand] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<null | TryItOutResponse>(null);
  const [serverUrl, setServerUrl] = useState(endpoint.serverUrl);

  const resetGeneratedCurl = () => {
    setCurlCommand('');
  };

  const handleBodyChange = (value: string) => {
    resetGeneratedCurl();
    setBody(value);
  };

  const handleParameterChange = (parameter: SwaggerEndpointParameter, value: string) => {
    resetGeneratedCurl();
    setParameterValues((currentValues) => ({
      ...currentValues,
      [getParameterKey(parameter)]: value,
    }));
  };

  const handleServerUrlChange = (value: string) => {
    resetGeneratedCurl();
    setServerUrl(value);
  };

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      showToast(tToast('curlCopySuccess'), 'success');
    } catch {
      showToast(tToast('curlCopyError'), 'error');
    }
  };

  const handleGenerateCurl = () => {
    setError('');

    const request = buildTryItOutRequest(endpoint, serverUrl, parameterValues, body);

    if (!request) {
      setCurlCommand('');
      setError(t('tryItOutInvalidUrl'));
      return;
    }

    setCurlCommand(buildCurlCommand(request));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setResponse(null);

    const request = buildTryItOutRequest(endpoint, serverUrl, parameterValues, body);

    if (!request) {
      setError(t('tryItOutInvalidUrl'));
      return;
    }

    setIsExecuting(true);

    try {
      const result = await fetch('/api/try-it-out', {
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const payload = await result.json();

      if (!result.ok) {
        setError(t(getTryItOutErrorKey(payload.errorCode)));
        showToast(tToast('requestNetworkError'), 'error');
        return;
      }

      setResponse(payload as TryItOutResponse);
    } catch {
      setError(t('tryItOutFailed'));
      showToast(tToast('requestNetworkError'), 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DetailSection title={t('tryItOutTitle')}>
        <TextField
          fullWidth
          label={t('serverUrlLabel')}
          onChange={(event) => handleServerUrlChange(event.target.value)}
          size="small"
          value={serverUrl}
        />

        {endpoint.parameters.map((parameter) => (
          <TextField
            fullWidth
            key={getParameterKey(parameter)}
            label={`${parameter.in}: ${parameter.name}`}
            onChange={(event) => handleParameterChange(parameter, event.target.value)}
            required={parameter.required}
            size="small"
            value={parameterValues[getParameterKey(parameter)] ?? ''}
          />
        ))}

        {endpoint.requestBody && (
          <TextField
            fullWidth
            label={t('requestBodyInputLabel')}
            minRows={4}
            multiline
            onChange={(event) => handleBodyChange(event.target.value)}
            size="small"
            value={body}
          />
        )}

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button disabled={isExecuting} type="submit" variant="contained">
            {isExecuting ? t('executingLabel') : t('executeButton')}
          </Button>
          <Button onClick={handleGenerateCurl} type="button" variant="outlined">
            {t('generateCurlButton')}
          </Button>
        </Stack>

        {curlCommand && (
          <Paper sx={{ p: 1.5 }} variant="outlined">
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography sx={{ fontWeight: 600 }} variant="caption">
                  {t('curlCommandLabel')}
                </Typography>
                <Button onClick={handleCopyCurl} size="small" type="button" variant="text">
                  {t('copyCurlButton')}
                </Button>
              </Stack>
              <Box
                component="pre"
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
                {curlCommand}
              </Box>
            </Stack>
          </Paper>
        )}

        {error && <Alert severity="error">{error}</Alert>}
        {response && <TryItOutResponseDetails response={response} />}
      </DetailSection>
    </Box>
  );
}

function TryItOutResponseDetails({ response }: { response: TryItOutResponse }) {
  const t = useTranslations('swaggerViewer');
  const responseHeaders = Object.entries(response.headers);

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            color={response.status >= 400 ? 'error' : 'success'}
            label={`${response.status} ${response.statusText}`}
            size="small"
          />
          <Chip label={`${response.durationMs}ms`} size="small" variant="outlined" />
        </Stack>

        <Typography sx={{ fontWeight: 600 }} variant="caption">
          {t('responseHeadersLabel')}
        </Typography>
        <Box
          component="pre"
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
          {responseHeaders.length > 0
            ? responseHeaders.map(([key, value]) => `${key}: ${value}`).join('\n')
            : t('noResponseHeaders')}
        </Box>

        <Typography sx={{ fontWeight: 600 }} variant="caption">
          {t('responseBodyLabel')}
        </Typography>
        <Box
          component="pre"
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
          {response.body || t('emptyResponseBody')}
        </Box>
      </Stack>
    </Paper>
  );
}
