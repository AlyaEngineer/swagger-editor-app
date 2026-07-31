import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpointRequestBody } from '@/utils/swagger-editor/get-swagger-endpoints';

import { ContentTypes } from './content-types';
import { Examples } from './examples';
import { SchemaText } from './schema-text';

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
