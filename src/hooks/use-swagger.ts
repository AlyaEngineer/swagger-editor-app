import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { DEFAULT_SCHEMA } from '@/constants/default-schema';
import { type SavedSchema } from '@/services/schema-persistence';
import { OpenApiDocument } from '@/types';
import { convertSchema } from '@/utils/swagger-editor/schema-format';
import { type SchemaFormat } from '@/utils/swagger-editor/schema-types';
import { validateSwaggerSchema } from '@/utils/swagger-editor/swagger-validation';

const VALIDATION_DEBOUNCE_MS = 400;

export const useSwagger = (initialSchema?: null | SavedSchema) => {
  const [editorValue, setEditorValue] = useState(initialSchema?.content ?? DEFAULT_SCHEMA);
  const [schema, setSchema] = useState<null | OpenApiDocument>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [format, setFormat] = useState<SchemaFormat>(initialSchema?.format ?? 'yaml');
  const t = useTranslations('swaggerEditor');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      validateSwaggerSchema(editorValue)
        .then((result) => {
          setIsValid(result.isValid);
          setError(result.error);
          setSchema(result.schema);

          if (result.isValid) {
            setFormat(result.detectedFormat);
          }
        })
        .catch((validationError) => {
          setError(
            validationError instanceof Error ? validationError.message : t('conversionError'),
          );
        });
    }, VALIDATION_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [editorValue, t]);

  function handleEditorChange(value: string) {
    setEditorValue(value);
  }

  function handleFormatToggle() {
    const nextFormat: SchemaFormat = format === 'json' ? 'yaml' : 'json';

    try {
      const convertedSchema = convertSchema(editorValue, nextFormat);

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
