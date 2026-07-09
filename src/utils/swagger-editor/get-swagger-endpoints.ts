import type { OpenApiDocument } from '@/types';

const HTTP_METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace']);

export type SwaggerEndpoint = {
  method: string;
  path: string;
  summary: string;
};

type OperationObject = {
  operationId?: string;
  summary?: string;
};

export function getSwaggerEndpoints(schema: null | OpenApiDocument): SwaggerEndpoint[] {
  if (!schema || typeof schema.paths !== 'object' || schema.paths === null) {
    return [];
  }

  const paths = schema.paths as Record<string, unknown>;

  return Object.entries(paths).flatMap(([path, pathItem]) => {
    if (typeof pathItem !== 'object' || pathItem === null) {
      return [];
    }

    return Object.entries(pathItem as Record<string, unknown>)
      .filter(([method]) => HTTP_METHODS.has(method.toLowerCase()))
      .map(([method, operation]) => {
        const operationObject =
          typeof operation === 'object' && operation !== null ? (operation as OperationObject) : {};

        return {
          method: method.toUpperCase(),
          path,
          summary: operationObject.summary || operationObject.operationId || 'No summary',
        };
      });
  });
}
