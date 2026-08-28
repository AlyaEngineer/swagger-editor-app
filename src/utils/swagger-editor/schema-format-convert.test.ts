import { describe, expect, it } from 'vitest';

import { convertSchema } from './schema-format';

describe('convertSchema', () => {
  it('converts JSON to YAML', () => {
    const yaml = convertSchema('{"openapi": "3.0.0", "info": {"title": "Test"}}', 'yaml');

    expect(yaml).toContain('openapi: 3.0.0');
    expect(yaml).toContain('title: Test');
  });

  it('converts YAML to JSON', () => {
    const json = convertSchema('openapi: 3.0.0\ninfo:\n  title: Test', 'json');
    const parsed = JSON.parse(json);

    expect(parsed).toEqual({ info: { title: 'Test' }, openapi: '3.0.0' });
  });

  it('round-trip JSON - YAML - JSON preserves data', () => {
    const original = {
      description: 'Multiline\ntext with\nbreaks',
      largeNumber: 9007199254740991,
      nested: { array: [1, 2, 3], deep: { value: true } },
      specialChars: 'кириллица и "кавычки" & символы',
    };

    const sourceJson = JSON.stringify(original);
    const yaml = convertSchema(sourceJson, 'yaml');
    const backToJson = convertSchema(yaml, 'json');

    expect(JSON.parse(backToJson)).toEqual(original);
  });

  it('throws an error when converting an invalid schema', () => {
    expect(() => convertSchema('', 'json')).toThrow('Schema is empty');
  });
});
