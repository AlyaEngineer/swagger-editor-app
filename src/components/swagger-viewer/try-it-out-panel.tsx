'use client';

import type { FormEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type {
  SwaggerEndpoint,
  SwaggerEndpointParameter,
} from '@/utils/swagger-editor/get-swagger-endpoints';

import { useToast } from '@/providers/toast-provider/ToastProvider';

import { CurlCommandPreview } from './curl-command-preview';
import { DetailSection } from './endpoint-details';
import {
  buildCurlCommand,
  buildTryItOutRequest,
  getParameterKey,
  getTryItOutErrorKey,
} from './swagger-viewer.helpers';
import { type TryItOutResponse, TryItOutResponseDetails } from './try-it-out-response-details';

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

        {curlCommand && <CurlCommandPreview command={curlCommand} onCopy={handleCopyCurl} />}

        {error && <Alert severity="error">{error}</Alert>}
        {response && <TryItOutResponseDetails response={response} />}
      </DetailSection>
    </Box>
  );
}
