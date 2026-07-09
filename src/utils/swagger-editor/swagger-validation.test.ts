import { describe, expect, it } from 'vitest';

import { validateSwaggerSchema } from './swagger-validation';

const validOpenApiYaml = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users
      responses:
        '200':
          description: Successful response
`;

const brokenJson = '{"openapi": "3.0.0", "info": {}';

const brokenYaml = `openapi: 3.0.0
info:
  title: Test API
   version: 1.0.0
`;

const validJsonNotOpenApi = '{"foo": "bar", "baz": 42}';

const duplicateKeysYaml = `openapi: 3.0.0
info:
  title: First
  title: Second
paths: {}
`;

describe('validateSwaggerSchema', () => {
  it('returns isValid true for a valid OpenAPI schema', async () => {
    const result = await validateSwaggerSchema(validOpenApiYaml);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.schema).not.toBeNull();
  });

  it('returns isValid false with an error for broken JSON', async () => {
    const result = await validateSwaggerSchema(brokenJson);

    expect(result.isValid).toBe(false);
    expect(result.error).not.toBeNull();
  });

  it('returns isValid false with an error for broken YAML indentation', async () => {
    const result = await validateSwaggerSchema(brokenYaml);

    expect(result.isValid).toBe(false);
    expect(result.error).not.toBeNull();
  });

  it('returns a semantic error for valid JSON that is not an OpenAPI document', async () => {
    const result = await validateSwaggerSchema(validJsonNotOpenApi);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('openapi');
  });

  it('returns isValid false for YAML with duplicate keys', async () => {
    const result = await validateSwaggerSchema(duplicateKeysYaml);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/unique/i);
  });

  it('returns isValid false for empty input', async () => {
    const result = await validateSwaggerSchema('');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Schema is empty');
  });
});
