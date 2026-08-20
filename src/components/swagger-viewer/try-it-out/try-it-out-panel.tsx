'use client';

import type { FormEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type {
  SwaggerEndpoint,
  SwaggerEndpointParameter,
  SwaggerMediaType,
} from '@/utils/swagger-editor/get-swagger-endpoints';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useToast } from '@/providers/toast-provider/ToastProvider';

import { SectionLabel } from '../endpoint-details';
import { CurlCommandPreview } from './curl-command-preview';
import { type TryItOutResponse, TryItOutResponseDetails } from './try-it-out-response-details';
import {
  buildCurlCommand,
  buildTryItOutRequest,
  getParameterKey,
  getTryItOutErrorKey,
} from './try-it-out.helpers';

export function TryItOutPanel({
  contentType,
  endpoint,
}: {
  contentType: string;
  endpoint: SwaggerEndpoint;
}) {
  const t = useTranslations('swaggerViewer');
  const tToast = useTranslations('toaster');
  const showToast = useToast();
  const mediaTypes = useMemo(() => endpoint.requestBody?.mediaTypes ?? [], [endpoint.requestBody]);
  const [body, setBody] = useState(getExample(mediaTypes, contentType));
  const [curlCommand, setCurlCommand] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [previousContentType, setPreviousContentType] = useState(contentType);
  const [response, setResponse] = useState<null | TryItOutResponse>(null);
  const [serverUrl, setServerUrl] = useState(endpoint.serverUrl);
  const copyToClipboard = useCopyToClipboard();

  if (previousContentType !== contentType) {
    setPreviousContentType(contentType);
    setBody(getExample(mediaTypes, contentType));
    setCurlCommand('');
  }

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

  const handleCopyCurl = () => copyToClipboard(curlCommand, 'curlCopySuccess', 'curlCopyError');

  const handleGenerateCurl = () => {
    setError('');

    if (hasMissingRequiredFields(endpoint, parameterValues, body)) {
      setCurlCommand('');
      setError(t('tryItOutMissingRequiredFields'));
      return;
    }

    const request = buildTryItOutRequest(endpoint, serverUrl, parameterValues, body, contentType);

    if (!request) {
      setCurlCommand('');
      setError(t('tryItOutInvalidUrl'));
      return;
    }

    setCurlCommand(buildCurlCommand(request));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isExecuting) {
      return;
    }

    setError('');
    setResponse(null);

    const request = buildTryItOutRequest(endpoint, serverUrl, parameterValues, body, contentType);

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
    <Box aria-label={t('tryItOutTitle')} component="form" onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <SectionLabel>{t('tryItOutTitle')}</SectionLabel>
      </Box>

      <Stack spacing={2}>
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
            helperText={contentType ? `${t('mediaTypeLabel')}: ${contentType}` : undefined}
            label={t('requestBodyInputLabel')}
            maxRows={12}
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
      </Stack>
    </Box>
  );
}

function getExample(mediaTypes: SwaggerMediaType[], contentType: string) {
  const mediaType = mediaTypes.find((item) => item.contentType === contentType);

  if (!mediaType) {
    return '';
  }

  return mediaType.examples[0] ?? mediaType.generatedExample;
}

function hasMissingRequiredFields(
  endpoint: SwaggerEndpoint,
  parameterValues: Record<string, string>,
  body: string,
) {
  const hasMissingParameter = endpoint.parameters.some(
    (parameter) => parameter.required && !parameterValues[getParameterKey(parameter)]?.trim(),
  );
  const hasMissingBody = Boolean(endpoint.requestBody?.required && !body.trim());

  return hasMissingParameter || hasMissingBody;
}
