'use client';
import type { OnMount } from '@monaco-editor/react';

import { Box, CircularProgress } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

import { flex } from '@/constants';
import { SchemaFormat } from '@/utils/swagger-editor/schema-types';

const TAB_SIZE = 2;
const FONT_SIZE = 14;

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  loading: () => (
    <Box sx={{ ...flex(), height: '100%' }}>
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
  const editorRef = useRef<null | Parameters<OnMount>[0]>(null);
  const monacoRef = useRef<null | Parameters<OnMount>[1]>(null);
  const { mode, systemMode } = useColorScheme();

  const resolvedMode = mode === 'system' ? systemMode : mode;
  const monacoTheme = resolvedMode === 'dark' ? 'vs-dark' : 'vs';

  function applyLanguage(nextFormat: SchemaFormat) {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) {
      return;
    }

    const model = editor.getModel();

    if (model) {
      monaco.editor.setModelLanguage(model, nextFormat);
    }
  }

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    applyLanguage(format);
  };

  useEffect(() => {
    applyLanguage(format);
  }, [format]);
  return (
    <MonacoEditor
      height="100%"
      onChange={(nextValue) => onChange(nextValue ?? '')}
      onMount={handleMount}
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
      theme={monacoTheme}
      value={value}
    />
  );
}
