import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpointParameter } from '@/utils/swagger-editor/get-swagger-endpoints';

import { SchemaText } from './schema-text';

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
