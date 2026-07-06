import { useEffect, useState } from 'react';

import { DEFAULT_SCHEMA } from '@/constants/default-schema';
import { OpenApiDocument } from '@/types';
import { convertSchema, type SchemaFormat } from '@/utils/swagger-editor/schema-format';
import { validateSwaggerSchema } from '@/utils/swagger-editor/swagger-validation';

export const useSwaggerHook = () => {
  const [editorValue, setEditorValue] = useState(DEFAULT_SCHEMA);
  const [schema, setSchema] = useState<null | OpenApiDocument>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [format, setFormat] = useState<SchemaFormat>('yaml');

  // TO DO заменить на рабочую авторизацию
  const { isAuthenticated } = {
    isAuthenticated: true,
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      const result = await validateSwaggerSchema(editorValue);

      setIsValid(result.isValid);
      setError(result.error);
      setSchema(result.schema);

      if (result.isValid) {
        setFormat(result.detectedFormat);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [editorValue]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function restoreSchema() {
      const response = await fetch('/api/schema');

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.schema?.content) {
        setEditorValue(data.schema.content);
        setFormat(data.schema.format);
      }
    }

    restoreSchema();
  }, [isAuthenticated]);

  function handleFormatToggle() {
    const nextFormat: SchemaFormat = format === 'json' ? 'yaml' : 'json';

    try {
      const convertedSchema = convertSchema(editorValue, nextFormat);

      setEditorValue(convertedSchema);
      setFormat(nextFormat);
      setError(null);
    } catch (conversionError) {
      setError(
        conversionError instanceof Error ? conversionError.message : 'Failed to convert schema',
      );
    }
  }

  return {
    editorValue,
    error,
    format,
    handleFormatToggle,
    isValid,
    schema,
    setEditorValue,
    setError,
  };
};
