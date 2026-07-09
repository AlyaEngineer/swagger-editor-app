import { describe, expect, it } from 'vitest';

import { parseSchema } from './schema-format';

describe('parseSchema', () => {
  it('parses valid JSON', () => {
    const result = parseSchema('{"openapi": "3.0.0"}');

    expect(result.format).toBe('json');
    expect(result.schema).toEqual({ openapi: '3.0.0' });
  });

  it('parses valid YAML', () => {
    const result = parseSchema('openapi: 3.0.0\ninfo:\n  title: Test');

    expect(result.format).toBe('yaml');
    expect(result.schema).toEqual({ info: { title: 'Test' }, openapi: '3.0.0' });
  });

  it('throws an error for an empty string', () => {
    expect(() => parseSchema('')).toThrow('Schema is empty');
  });

  it('throws an error for a string with only whitespace', () => {
    expect(() => parseSchema('   \n  \t  ')).toThrow('Schema is empty');
  });

  it("throws a JSON error if the input looks like JSON but doesn't parse as either JSON or YAML", () => {
    expect(() => parseSchema('{ broken json')).toThrow();
  });

  it('throws an error for duplicate keys in YAML', () => {
    const duplicateKeysYaml = 'info:\n  title: First\n  title: Second\n';

    expect(() => parseSchema(duplicateKeysYaml)).toThrow(/unique/i);
  });

  it('throws an error if the parsed value is not an object', () => {
    expect(() => parseSchema('[1, 2, 3]')).toThrow('Schema must be an object');
  });
});
