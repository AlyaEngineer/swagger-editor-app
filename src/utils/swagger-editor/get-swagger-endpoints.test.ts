import { describe, expect, it } from 'vitest';

import type { OpenApiDocument } from '@/types';

import { getSwaggerEndpoints } from './get-swagger-endpoints';

describe('getSwaggerEndpoints', () => {
  it('extracts OpenAPI 3 endpoint details', () => {
    const schema = {
      info: { title: 'Test API', version: '1.0.0' },
      openapi: '3.0.0',
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            parameters: [
              {
                description: 'Locale header.',
                in: 'header',
                name: 'Accept-Language',
                schema: { type: 'string' },
              },
              {
                in: 'query',
                name: 'includePosts',
                schema: { type: 'boolean' },
              },
            ],
            responses: {
              '200': {
                content: {
                  'application/json': {
                    example: { id: '42', name: 'Ada' },
                    schema: {
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                      type: 'object',
                    },
                  },
                },
                description: 'User response.',
              },
              '404': {
                description: 'User not found.',
              },
            },
            summary: 'Get user',
          },
          parameters: [
            {
              description: 'User identifier.',
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          post: {
            requestBody: {
              content: {
                'application/json': {
                  example: { name: 'Ada' },
                  schema: {
                    properties: {
                      name: { type: 'string' },
                    },
                    type: 'object',
                  },
                },
              },
              description: 'User payload.',
              required: true,
            },
            responses: {
              '201': {
                description: 'Created.',
              },
            },
          },
          put: {
            operationId: 'updateUser',
            responses: {
              '204': {
                description: 'Updated.',
              },
            },
          },
        },
      },
      servers: [{ url: 'https://api.example.com/v1' }],
    } as OpenApiDocument;

    expect(getSwaggerEndpoints(schema)).toEqual([
      {
        description: '',
        method: 'GET',
        operationId: 'getUser',
        parameters: [
          {
            description: 'User identifier.',
            in: 'path',
            name: 'id',
            required: true,
            schema: 'string',
          },
          {
            description: 'Locale header.',
            in: 'header',
            name: 'Accept-Language',
            required: false,
            schema: 'string',
          },
          {
            description: '',
            in: 'query',
            name: 'includePosts',
            required: false,
            schema: 'boolean',
          },
        ],
        path: '/users/{id}',
        requestBody: null,
        responses: [
          {
            description: 'User response.',
            mediaTypes: [
              {
                contentType: 'application/json',
                examples: [JSON.stringify({ id: '42', name: 'Ada' }, null, 2)],
                generatedExample: JSON.stringify({ id: 'string', name: 'string' }, null, 2),
                schema: 'object { id, name }',
              },
            ],
            statusCode: '200',
          },
          {
            description: 'User not found.',
            mediaTypes: [],
            statusCode: '404',
          },
        ],
        serverUrl: 'https://api.example.com/v1',
        summary: 'Get user',
      },
      {
        description: '',
        method: 'POST',
        operationId: '',
        parameters: [
          {
            description: 'User identifier.',
            in: 'path',
            name: 'id',
            required: true,
            schema: 'string',
          },
        ],
        path: '/users/{id}',
        requestBody: {
          description: 'User payload.',
          mediaTypes: [
            {
              contentType: 'application/json',
              examples: [JSON.stringify({ name: 'Ada' }, null, 2)],
              generatedExample: JSON.stringify({ name: 'string' }, null, 2),
              schema: 'object { name }',
            },
          ],
          required: true,
        },
        responses: [
          {
            description: 'Created.',
            mediaTypes: [],
            statusCode: '201',
          },
        ],
        serverUrl: 'https://api.example.com/v1',
        summary: '',
      },
      {
        description: '',
        method: 'PUT',
        operationId: 'updateUser',
        parameters: [
          {
            description: 'User identifier.',
            in: 'path',
            name: 'id',
            required: true,
            schema: 'string',
          },
        ],
        path: '/users/{id}',
        requestBody: null,
        responses: [
          {
            description: 'Updated.',
            mediaTypes: [],
            statusCode: '204',
          },
        ],
        serverUrl: 'https://api.example.com/v1',
        summary: 'updateUser',
      },
    ]);
  });

  it('extracts Swagger 2 body parameters and response schemas', () => {
    const schema = {
      basePath: '/v2',
      host: 'api.example.com',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/pets': {
          post: {
            consumes: ['application/json'],
            parameters: [
              {
                description: 'Pet payload.',
                in: 'body',
                name: 'pet',
                required: true,
                schema: { $ref: '#/definitions/Pet' },
              },
            ],
            responses: {
              default: {
                description: 'Unexpected error.',
                examples: {
                  'application/json': { message: 'Error' },
                },
                schema: { $ref: '#/definitions/Error' },
              },
            },
          },
        },
      },
      schemes: ['http'],
      swagger: '2.0',
    } as OpenApiDocument;

    expect(getSwaggerEndpoints(schema)).toEqual([
      {
        description: '',
        method: 'POST',
        operationId: '',
        parameters: [],
        path: '/pets',
        requestBody: {
          description: 'Pet payload.',
          mediaTypes: [
            {
              contentType: 'application/json',
              examples: [],
              generatedExample: '',
              schema: '#/definitions/Pet',
            },
          ],
          required: true,
        },
        responses: [
          {
            description: 'Unexpected error.',
            mediaTypes: [
              {
                contentType: 'application/json',
                examples: [JSON.stringify({ message: 'Error' }, null, 2)],
                generatedExample: '',
                schema: '#/definitions/Error',
              },
            ],
            statusCode: 'default',
          },
        ],
        serverUrl: 'http://api.example.com/v2',
        summary: '',
      },
    ]);
  });

  it('skips paths where the path item is not a record', () => {
    const schema = {
      paths: {
        '/broken': null,
        '/users': {
          get: { responses: {} },
        },
      },
    } as unknown as OpenApiDocument;

    const endpoints = getSwaggerEndpoints(schema);

    expect(endpoints).toHaveLength(1);
    expect(endpoints[0].path).toBe('/users');
  });

  it('keeps a plain string example as-is', () => {
    const schema = {
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                content: {
                  'text/plain': {
                    example: 'plain text response',
                  },
                },
                description: 'OK',
              },
            },
          },
        },
      },
    } as unknown as OpenApiDocument;

    const endpoints = getSwaggerEndpoints(schema);

    expect(endpoints[0].responses[0].mediaTypes[0].examples).toEqual(['plain text response']);
  });

  it('extracts OpenAPI 3 named examples with a value wrapper', () => {
    const schema = {
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  examples: {
                    ada: { value: { name: 'Ada' } },
                    bob: 'raw string example',
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    } as unknown as OpenApiDocument;

    const endpoints = getSwaggerEndpoints(schema);

    expect(endpoints[0].requestBody?.mediaTypes[0].examples).toEqual([
      JSON.stringify({ name: 'Ada' }, null, 2),
      'raw string example',
    ]);
  });

  it('ignores non-record entries in a parameters array', () => {
    const schema = {
      paths: {
        '/users': {
          get: {
            parameters: [null, 'not-an-object', { in: 'query', name: 'page' }],
            responses: {},
          },
        },
      },
    } as unknown as OpenApiDocument;

    const endpoints = getSwaggerEndpoints(schema);

    expect(endpoints[0].parameters).toEqual([
      {
        description: '',
        in: 'query',
        name: 'page',
        required: false,
        schema: '',
      },
    ]);
  });

  it('stringifies array, enum, oneOf, anyOf, and allOf schemas', () => {
    const schema = {
      paths: {
        '/items': {
          get: {
            parameters: [
              { in: 'query', name: 'tags', schema: { items: { type: 'string' }, type: 'array' } },
              { in: 'query', name: 'status', schema: { enum: ['active', 'inactive'] } },
              {
                in: 'query',
                name: 'variant',
                schema: { oneOf: [{ type: 'string' }, { type: 'number' }] },
              },
              { in: 'query', name: 'mixed', schema: { anyOf: [{ type: 'string' }] } },
              {
                in: 'query',
                name: 'combined',
                schema: { allOf: [{ type: 'string' }, { type: 'number' }] },
              },
              { in: 'query', name: 'formatted', schema: { format: 'date-time', type: 'string' } },
              { in: 'query', name: 'unknown', schema: { unsupportedKeyword: true } },
            ],
            responses: {},
          },
        },
      },
    } as unknown as OpenApiDocument;

    const endpoints = getSwaggerEndpoints(schema);
    const schemas = Object.fromEntries(
      endpoints[0].parameters.map((parameter) => [parameter.name, parameter.schema]),
    );

    expect(schemas).toEqual({
      combined: 'allOf (2)',
      formatted: 'string (date-time)',
      mixed: 'anyOf (1)',
      status: 'enum: active, inactive',
      tags: 'array<string>',
      unknown: '',
      variant: 'oneOf (2)',
    });
  });
});
