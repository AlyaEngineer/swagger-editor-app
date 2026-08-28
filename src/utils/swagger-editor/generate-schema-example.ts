import { isRecord } from './is-record';

const MAX_DEPTH = 4;

export function generateSchemaExample(schema: unknown): string {
  const value = buildValue(schema, 0);

  return value === undefined ? '' : JSON.stringify(value, null, 2);
}

function buildObject(properties: Record<string, unknown>, depth: number) {
  const result: Record<string, unknown> = {};

  for (const [name, property] of Object.entries(properties)) {
    const value = buildValue(property, depth + 1);

    if (value !== undefined) {
      result[name] = value;
    }
  }

  return result;
}

function buildValue(schema: unknown, depth: number): unknown {
  if (!isRecord(schema) || depth > MAX_DEPTH) {
    return undefined;
  }

  if ('example' in schema) {
    return schema.example;
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  switch (schema.type) {
    case 'array': {
      const item = buildValue(schema.items, depth + 1);

      return item === undefined ? [] : [item];
    }
    case 'boolean':
      return true;
    case 'integer':
    case 'number':
      return 0;
    case 'string':
      return 'string';
    default:
      return isRecord(schema.properties) ? buildObject(schema.properties, depth) : undefined;
  }
}
