'use client';

import type { FormEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type {
  SwaggerEndpoint,
  SwaggerEndpointParameter,
} from '@/utils/swagger-editor/get-swagger-endpoints';

import { useToast } from '@/providers/toast-provider/ToastProvider';

import { DetailSection } from './endpoint-details';
import {
  buildCurlCommand,
  buildTryItOutRequest,
  getParameterKey,
  getTryItOutErrorKey,
} from './swagger-viewer.helpers';

type TryItOutResponse = {
  body: string;
  durationMs: number;
  headers: Record<string, string>;
  status: number;
  statusText: string;
};

export function TryItOutPanel({ endpoint }: { endpoint: SwaggerEndpoint }) {
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
