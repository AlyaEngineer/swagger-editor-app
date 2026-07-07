import SwaggerParser from '@apidevtools/swagger-parser';

import { OpenApiDocument } from '@/types';

import { parseSchema } from './schema-format';

export type ValidationResult = {
  detectedFormat: 'json' | 'yaml';
  error: null | string;
  isValid: boolean;
  schema: null | OpenApiDocument;
};

export async function validateSwaggerSchema(source: string): Promise<ValidationResult> {
  try {
    const { format, schema } = parseSchema(source);

    if (!isOpenApiDocument(schema)) {
      throw new Error('Schema must contain "openapi" or "swagger", "info", and "paths" fields');
    }

    await SwaggerParser.validate(schema, {
      resolve: {
        external: false,
      },
    });

    return {
      detectedFormat: format,
      error: null,
      isValid: true,
      schema,
    };
  } catch (error) {
    return {
      detectedFormat: 'json',
      error: error instanceof Error ? error.message : 'Invalid schema',
      isValid: false,
      schema: null,
    };
  }
}

function isOpenApiDocument(schema: unknown): schema is OpenApiDocument {
  if (!isRecord(schema)) {
    return false;
  }

  return (
    isRecord(schema.info) &&
    isRecord(schema.paths) &&
    (typeof schema.openapi === 'string' || typeof schema.swagger === 'string')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
