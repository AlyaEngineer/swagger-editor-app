'use client';

import type { SxProps, Theme } from '@mui/material/styles';

import { SwaggerMonacoEditor, SwaggerViewer } from '@components';
import { Alert, alpha, Box, Paper, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

import { type SavedSchema } from '@/services/schema-persistence';
import { useSwagger } from '@/utils/hooks/use-swagger';
import { getSwaggerEndpoints } from '@/utils/swagger-editor/get-swagger-endpoints';

import { MainText } from '../main-text/main-text';
import { SwaggerControl } from '../swagger-control/swagger-control';

const pageSx: SxProps<Theme> = {
  minHeight: 'calc(100dvh - 80px)',
  p: 3,
};

const statusSx: SxProps<Theme> = {
  minHeight: 80,
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

const panelBaseSx: SxProps<Theme> = {
  borderRadius: '8px',
  boxShadow: (theme) =>
    `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}, 0 8px 24px ${alpha(theme.palette.primary.main, 0.24)}`,
  minHeight: 420,
};

const editorPanelSx: SxProps<Theme> = {
  ...panelBaseSx,
  overflow: 'hidden',
};

const viewerPanelSx: SxProps<Theme> = {
  ...panelBaseSx,
  overflow: 'auto',
  p: 2,
};

type Props = {
  initialSchema?: null | SavedSchema;
};

export const SwaggerEditor = ({ initialSchema = null }: Props) => {
  const { editorValue, error, format, handleEditorChange, handleFormatToggle, isValid, schema } =
    useSwagger(initialSchema);

  const endpoints = getSwaggerEndpoints(schema);
  const apiInfo = schema
    ? {
        description: typeof schema.info.description === 'string' ? schema.info.description : '',
        title: typeof schema.info.title === 'string' ? schema.info.title : '',
        version: typeof schema.info.version === 'string' ? schema.info.version : '',
      }
    : null;

  const t = useTranslations('swaggerEditor');

  return (
    <Box sx={pageSx}>
      <Stack spacing={2}>
        <MainText />

        <Box sx={statusSx}>
          {error && <Alert severity="error">{error}</Alert>}

          {isValid && !error && (
            <Alert severity="success">{t('schemaValid', { count: endpoints.length })}</Alert>
          )}
        </Box>

        <SwaggerControl
          editorValue={editorValue}
          format={format}
          handleFormatToggle={handleFormatToggle}
          isValid={isValid}
        />

        <Box sx={workspaceSx}>
          <Paper sx={editorPanelSx}>
            <SwaggerMonacoEditor
              format={format}
              onChange={handleEditorChange}
              value={editorValue}
            />
          </Paper>

          <Paper sx={viewerPanelSx}>
            <SwaggerViewer apiInfo={apiInfo} endpoints={endpoints} isValid={isValid} />
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};
