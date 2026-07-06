'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

type SwaggerViewerProps = {
  endpoints: SwaggerEndpoint[];
  isValid: boolean;
};

export function SwaggerViewer({ endpoints, isValid }: SwaggerViewerProps) {
  if (!isValid) {
    return (
      <Alert severity="info">Paste a valid OpenAPI/Swagger schema to populate the viewer.</Alert>
    );
  }

  if (endpoints.length === 0) {
    return <Alert severity="warning">Schema is valid, but no endpoints were found in paths.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography component="h2" variant="h5">
        Swagger Viewer
      </Typography>

      {endpoints.map((endpoint) => (
        <Paper
          key={`${endpoint.method}-${endpoint.path}`}
          sx={{
            p: 2,
          }}
          variant="outlined"
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <Chip
              color="primary"
              label={endpoint.method}
              size="small"
              sx={{
                minWidth: 72,
              }}
            />

            <Box>
              <Typography fontWeight={700}>{endpoint.path}</Typography>
              <Typography color="text.secondary" variant="body2">
                {endpoint.summary}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
