import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { SwaggerEndpointParameter } from '@/utils/swagger-editor/get-swagger-endpoints';

import { MarkdownText } from '@/components/markdown-text/markdown-text';

import { SchemaText } from './schema-text';

export function ParameterDetails({ parameter }: { parameter: SwaggerEndpointParameter }) {
  const t = useTranslations('swaggerViewer');

  return (
    <Paper sx={{ p: 1.5 }} variant="outlined">
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }} variant="body2">
            {parameter.name}
          </Typography>
          <Chip label={parameter.in} size="small" variant="outlined" />
          <Chip
            color={parameter.required ? 'warning' : 'default'}
            label={parameter.required ? t('requiredLabel') : t('optionalLabel')}
            size="small"
            sx={{ fontWeight: 600 }}
            variant="outlined"
          />
        </Stack>

        {parameter.description && (
          <>
            <MarkdownText>{parameter.description}</MarkdownText>
            <Divider />
          </>
        )}

        <SchemaText schema={parameter.schema} />
      </Stack>
    </Paper>
  );
}
