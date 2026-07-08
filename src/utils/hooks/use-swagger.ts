import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { DEFAULT_SCHEMA } from '@/constants/default-schema';
import { SchemaService } from '@/services/schema-service';
import { OpenApiDocument } from '@/types';
import { convertSchema } from '@/utils/swagger-editor/schema-format';
import { type SchemaFormat } from '@/utils/swagger-editor/schema-types';
import { validateSwaggerSchema } from '@/utils/swagger-editor/swagger-validation';

export const useSwagger = () => {
  const [editorValue, setEditorValue] = useState(DEFAULT_SCHEMA);
  const [schema, setSchema] = useState<null | OpenApiDocument>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [format, setFormat] = useState<SchemaFormat>('yaml');
  const hasUserEditedRef = useRef(false);
  const t = useTranslations('swaggerEditor');

  // TO DO заменить на рабочую авторизацию
  const { isAuthenticated } = {
    isAuthenticated: true,
  };

  const VALIDATION_DEBOUNCE_MS = 400;

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      const result = await validateSwaggerSchema(editorValue);

      setIsValid(result.isValid);
      setError(result.error);
      setSchema(result.schema);

      if (result.isValid) {
        setFormat(result.detectedFormat);
      }
    }, VALIDATION_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [editorValue]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function restoreSchema() {
      const restored = await SchemaService.restore();

      if (restored && !hasUserEditedRef.current) {
        setEditorValue(restored.content);
        setFormat(restored.format);
      }
    }

    restoreSchema().catch((restoreError) => {
      setError(restoreError instanceof Error ? restoreError.message : t('restoreError'));
    });
  }, [isAuthenticated, t]);

  function handleEditorChange(value: string) {
    hasUserEditedRef.current = true;
    setEditorValue(value);
  }
  function handleFormatToggle() {
    const nextFormat: SchemaFormat = format === 'json' ? 'yaml' : 'json';

    try {
      const convertedSchema = convertSchema(editorValue, nextFormat);

      hasUserEditedRef.current = true;
      setEditorValue(convertedSchema);
      setFormat(nextFormat);
      setError(null);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : t('conversionError'));
    }
  }

  return {
    editorValue,
    error,
    format,
    handleEditorChange,
    handleFormatToggle,
    isValid,
    schema,
    setError,
  };
};
