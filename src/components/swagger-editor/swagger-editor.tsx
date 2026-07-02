'use client';

import type { SxProps, Theme } from '@mui/material/styles';

import { SwaggerMonacoEditor } from '@components';
import { Alert, Box, Paper, Stack } from '@mui/material';
import { useMemo } from 'react';

import { useSwaggerHook } from '@/utils/hooks/swagger-hook';
import { getSwaggerEndpoints } from '@/utils/swagger-editor/get-swagger-endpoints';

import { MainText } from '../main-text/main-text';
import { SwaggerControl } from '../swagger-control/swagger-control';

const pageSx: SxProps<Theme> = {
  minHeight: 'calc(100dvh - 80px)',
  p: 3,
};

const workspaceSx: SxProps<Theme> = {
  '@media (orientation: landscape)': {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  },
  '@media (orientation: portrait)': {
    gridTemplateRows: 'minmax(360px, 1fr) minmax(360px, 1fr)',
  },
  display: 'grid',

  gap: 2,

  minHeight: 680,
};

const editorPanelSx: SxProps<Theme> = {
  minHeight: 420,
  overflow: 'hidden',
};

const viewerPanelSx: SxProps<Theme> = {
  minHeight: 420,
  overflow: 'auto',
  p: 2,
};

export const SwaggerEditor = () => {
  const {
    editorValue,
    error,
    format,
    handleFormatToggle,
    isValid,
    schema,
    setEditorValue,
    setError,
  } = useSwaggerHook();

  const endpoints = useMemo(() => getSwaggerEndpoints(schema), [schema]);

  return (
    <Box sx={pageSx}>
      <Stack spacing={2}>
        <MainText />

        {error && <Alert severity="error">{error}</Alert>}

        {isValid && !error && (
          <Alert severity="success">Schema is valid. {endpoints.length} endpoint(s) found.</Alert>
        )}

        <SwaggerControl
          editorValue={editorValue}
          format={format}
          handleFormatToggle={handleFormatToggle}
          isValid={isValid}
          setError={setError}
        />

        <Box sx={workspaceSx}>
          <Paper sx={editorPanelSx}>
            <SwaggerMonacoEditor format={format} onChange={setEditorValue} value={editorValue} />
          </Paper>

          <Paper sx={viewerPanelSx}>SwaggerViewer</Paper>
        </Box>
      </Stack>
    </Box>
  );
};
