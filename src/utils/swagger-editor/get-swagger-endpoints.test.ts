import { describe, expect, it } from 'vitest';

import type { OpenApiDocument } from '@/types';

import { getSwaggerEndpoints } from './get-swagger-endpoints';

describe('getSwaggerEndpoints', () => {
  it('extracts OpenAPI 3 endpoint details', () => {
    const schema = {
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
            contentTypes: ['application/json'],
            description: 'User response.',
            examples: ['{"id":"42","name":"Ada"}'],
            schema: 'object { id, name }',
            statusCode: '200',
          },
          {
            contentTypes: [],
            description: 'User not found.',
            examples: [],
            schema: '',
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
          contentTypes: ['application/json'],
          description: 'User payload.',
          examples: ['{"name":"Ada"}'],
          required: true,
          schema: 'object { name }',
        },
        responses: [
          {
            contentTypes: [],
            description: 'Created.',
            examples: [],
            schema: '',
            statusCode: '201',
          },
        ],
        serverUrl: 'https://api.example.com/v1',
        summary: 'No summary',
      },
    ]);
  });

  it('extracts Swagger 2 body parameters and response schemas', () => {
    const schema = {
      basePath: '/v2',
      host: 'api.example.com',
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
          contentTypes: ['application/json'],
          description: 'Pet payload.',
          examples: [],
          required: true,
          schema: '#/definitions/Pet',
        },
        responses: [
          {
            contentTypes: [],
            description: 'Unexpected error.',
            examples: ['{"message":"Error"}'],
            schema: '#/definitions/Error',
            statusCode: 'default',
          },
        ],
        serverUrl: 'http://api.example.com/v2',
        summary: 'No summary',
      },
    ]);
  });
});
