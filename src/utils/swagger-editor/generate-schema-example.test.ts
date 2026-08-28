import { describe, expect, it } from 'vitest';

import { generateSchemaExample } from './generate-schema-example';

describe('generateSchemaExample', () => {
  it('prefers an explicit example over generated values', () => {
    expect(generateSchemaExample({ example: 'doggie', type: 'string' })).toBe('"doggie"');
  });

  it('takes the first enum value', () => {
    const schema = { enum: ['available', 'pending'], type: 'string' };

    expect(generateSchemaExample(schema)).toBe('"available"');
  });

  it('builds a nested object with placeholders by type', () => {
    const schema = {
      properties: {
        active: { type: 'boolean' },
        id: { type: 'integer' },
        owner: { properties: { name: { type: 'string' } }, type: 'object' },
      },
      type: 'object',
    };

    expect(JSON.parse(generateSchemaExample(schema))).toEqual({
      active: true,
      id: 0,
      owner: { name: 'string' },
    });
  });

  it('wraps array items in a single-element array', () => {
    const schema = { items: { type: 'string' }, type: 'array' };

    expect(JSON.parse(generateSchemaExample(schema))).toEqual(['string']);
  });

  it('returns an empty string for an unresolved reference', () => {
    expect(generateSchemaExample({ $ref: '#/components/schemas/Pet' })).toBe('');
  });

  it('stops at the depth limit instead of recursing forever', () => {
    const node: Record<string, unknown> = { type: 'object' };
    node.properties = { child: node };

    expect(() => generateSchemaExample(node)).not.toThrow();
  });
});
