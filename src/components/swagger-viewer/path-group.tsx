'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

import { EndpointPanel } from './endpoint-panel';

type PathGroupProps = {
  endpoints: SwaggerEndpoint[];
  path: string;
};

export function PathGroup({ endpoints, path }: PathGroupProps) {
  return (
    <Paper component="article" sx={{ borderRadius: '8px', overflow: 'hidden' }} variant="outlined">
      <Box sx={{ bgcolor: 'action.hover', px: 2, py: 1.5 }}>
        <Typography component="h3" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
          {path}
        </Typography>
      </Box>

      {endpoints.map((endpoint) => (
        <EndpointPanel endpoint={endpoint} key={`${endpoint.method}:${endpoint.path}`} />
      ))}
    </Paper>
  );
}
