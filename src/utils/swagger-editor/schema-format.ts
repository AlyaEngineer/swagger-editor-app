import { parse, stringify } from 'yaml';

export type ParsedSchema = {
  format: SchemaFormat;
  schema: Record<string, unknown>;
};

export type SchemaFormat = 'json' | 'yaml';

export function convertSchema(source: string, targetFormat: SchemaFormat): string {
  const { schema } = parseSchema(source);

  if (targetFormat === 'json') {
    return JSON.stringify(schema, null, 2);
  }

  return stringify(schema);
}

export function parseSchema(source: string): ParsedSchema {
  const trimmedSource = source.trim();

  if (!trimmedSource) {
    throw new Error('Schema is empty');
  }

  let jsonError: Error | null = null;

  try {
    const parsedJson = JSON.parse(trimmedSource);

    if (!isObject(parsedJson)) {
      throw new Error('Schema must be an object');
    }

    return {
      format: 'json',
      schema: parsedJson,
    };
  } catch (caughtJsonError) {
    jsonError = caughtJsonError instanceof Error ? caughtJsonError : new Error('Invalid JSON');
  }
  try {
    const parsedYaml = parse(trimmedSource, { uniqueKeys: true });

    if (!isObject(parsedYaml)) {
      throw new Error('Schema must be an object');
    }

    return {
      format: 'yaml',
      schema: parsedYaml,
    };
  } catch (yamlError) {
    if (looksLikeJson(trimmedSource)) {
      throw jsonError;
    }
    throw yamlError instanceof Error ? yamlError : new Error('Invalid YAML');
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function looksLikeJson(source: string): boolean {
  return source.startsWith('{') || source.startsWith('[');
}
