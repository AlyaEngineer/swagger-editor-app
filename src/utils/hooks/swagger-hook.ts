import { useEffect, useState } from 'react';

import { OpenApiDocument } from '@/types';
import { convertSchema, type SchemaFormat } from '@/utils/swagger-editor/schema-format';
import { validateSwaggerSchema } from '@/utils/swagger-editor/swagger-validation';

const DEFAULT_SCHEMA = `openapi: 3.0.0
info:
  title: Swagger Editor App
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users
      responses:
        '200':
          description: Successful response
  /users/{id}:
    get:
      summary: Get user by id
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
`;

export const useSwaggerHook = () => {
  const [editorValue, setEditorValue] = useState(DEFAULT_SCHEMA);
  const [schema, setSchema] = useState<null | OpenApiDocument>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [format, setFormat] = useState<SchemaFormat>('yaml');
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSaveSchema() {
    if (!isAuthenticated || !isValid) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/schema', {
        body: JSON.stringify({
          content: editorValue,
          format,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to save schema');
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save schema');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    editorValue,
    error,
    format,
    handleFormatToggle,
    handleSaveSchema,
    isSaving,
    isValid,
    schema,
    setEditorValue,
  };
};
