import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { SwaggerEndpointResponse } from '@/utils/swagger-editor/get-swagger-endpoints';

import { ContentTypes } from './content-types';
import { Examples } from './examples';
import { SchemaText } from './schema-text';

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
