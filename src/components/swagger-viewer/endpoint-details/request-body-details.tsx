import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpointRequestBody } from '@/utils/swagger-editor/get-swagger-endpoints';

import { MarkdownText } from '@/components/markdown-text/markdown-text';

import { Examples } from './examples';
import { MediaTypeSelect } from './media-type-select';
import { SchemaText } from './schema-text';

type RequestBodyDetailsProps = {
  contentType: string;
  onContentTypeChange: (contentType: string) => void;
  requestBody: SwaggerEndpointRequestBody;
};

export function RequestBodyDetails({
  contentType,
  onContentTypeChange,
  requestBody,
}: RequestBodyDetailsProps) {
  const t = useTranslations('swaggerViewer');
  const selectedMediaType =
    requestBody.mediaTypes.find((mediaType) => mediaType.contentType === contentType) ??
    requestBody.mediaTypes[0];

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
          <MediaTypeSelect
            mediaTypes={requestBody.mediaTypes}
            onChange={onContentTypeChange}
            value={contentType}
          />
        </Stack>

        {requestBody.description && <MarkdownText>{requestBody.description}</MarkdownText>}

        <SchemaText schema={selectedMediaType?.schema ?? ''} />
        <Examples examples={selectedMediaType?.examples ?? []} />
      </Stack>
    </Paper>
  );
}
