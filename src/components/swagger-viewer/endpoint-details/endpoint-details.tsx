import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type {
  SwaggerEndpointParameter,
  SwaggerEndpointRequestBody,
  SwaggerEndpointResponse,
} from '@/utils/swagger-editor/get-swagger-endpoints';

export function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, mb: 1 }} variant="body2">
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

export function EmptyDetails({ children }: { children: ReactNode }) {
  return (
    <Typography color="text.secondary" variant="body2">
      {children}
    </Typography>
  );
}

export function ParameterDetails({ parameter }: { parameter: SwaggerEndpointParameter }) {
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

export function RequestBodyDetails({ requestBody }: { requestBody: SwaggerEndpointRequestBody }) {
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

export function ResponseDetails({ response }: { response: SwaggerEndpointResponse }) {
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

function SchemaText({ schema }: { schema: string }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Typography color="text.secondary" variant="body2">
      {t('schemaLabel')}: {schema || t('schemaNotSpecified')}
    </Typography>
  );
}
