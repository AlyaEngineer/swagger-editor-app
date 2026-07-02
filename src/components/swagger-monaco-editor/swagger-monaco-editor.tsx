'use client';

import { Box, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';

import { flex } from '@/constants';
import { SchemaFormat } from '@/utils/swagger-editor/schema-format';

const TAB_SIZE = 2;
const FONT_SIZE = 14;

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  loading: () => (
    <Box
      sx={{
        ...flex(),
        height: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  ),
  ssr: false,
});

type SchemaCodeEditorProps = {
  format: SchemaFormat;
  onChange: (value: string) => void;
  value: string;
};

export function SwaggerMonacoEditor({ format, onChange, value }: SchemaCodeEditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language={format === 'json' ? 'json' : 'yaml'}
      onChange={(nextValue) => onChange(nextValue ?? '')}
      options={{
        automaticLayout: true,
        fontSize: FONT_SIZE,
        minimap: {
          enabled: false,
        },
        scrollBeyondLastLine: false,
        tabSize: TAB_SIZE,
        wordWrap: 'on',
      }}
      theme="vs-dark"
      value={value}
    />
  );
}
