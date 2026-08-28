'use client';

import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import type { SwaggerEndpointResponse } from '@/utils/swagger-editor/get-swagger-endpoints';

import { MarkdownText } from '@/components/markdown-text/markdown-text';
import { getStatusColor } from '@/utils/swagger-editor/get-status-color';

import { Examples } from './examples';
import { MediaTypeSelect } from './media-type-select';
import { SchemaText } from './schema-text';

export function ResponseDetails({ response }: { response: SwaggerEndpointResponse }) {
  const [contentType, setContentType] = useState(response.mediaTypes[0]?.contentType ?? '');
  const selectedMediaType =
    response.mediaTypes.find((mediaType) => mediaType.contentType === contentType) ??
    response.mediaTypes[0];

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            color={getStatusColor(response.statusCode)}
            label={response.statusCode}
            size="small"
            variant="outlined"
          />
          <MediaTypeSelect
            mediaTypes={response.mediaTypes}
            onChange={setContentType}
            value={contentType}
          />
        </Stack>

        {response.description && (
          <>
            <MarkdownText>{response.description}</MarkdownText>
            <Divider />
          </>
        )}

        <SchemaText schema={selectedMediaType?.schema ?? ''} />
        <Examples
          examples={selectedMediaType?.examples ?? []}
          generatedExample={selectedMediaType?.generatedExample ?? ''}
        />
      </Stack>
    </Paper>
  );
}
