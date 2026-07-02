'use client';

import type { SxProps, Theme } from '@mui/material/styles';

import { SwaggerMonacoEditor } from '@components';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { useSwaggerHook } from '@/utils/hooks/swagger-hook';
import { getSwaggerEndpoints } from '@/utils/swagger-editor/get-swagger-endpoints';

import { MainText } from '../main-text/main-text';

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
    handleSaveSchema,
    isSaving,
    isValid,
    schema,
    setEditorValue,
  } = useSwaggerHook();

  const endpoints = useMemo(() => getSwaggerEndpoints(schema), [schema]);

  // TODO: заменить на рабочую авторизацию
  const { isAuthenticated } = {
    isAuthenticated: true,
  };

  return (
    <Box sx={pageSx}>
      <Stack spacing={2}>
        <MainText />

        <Stack
          sx={{
            alignItems: 'center',
            direction: 'row',
            justifyContent: 'space-between',
          }}
        >
          <FormControlLabel
            control={<Switch checked={format === 'yaml'} onChange={handleFormatToggle} />}
            label={format === 'yaml' ? 'YAML' : 'JSON'}
          />

          {isAuthenticated && (
            <Button disabled={!isValid || isSaving} onClick={handleSaveSchema} variant="contained">
              {isSaving ? 'Saving...' : 'Save schema'}
            </Button>
          )}
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {isValid && !error && (
          <Alert severity="success">Schema is valid. {endpoints.length} endpoint(s) found.</Alert>
        )}

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
