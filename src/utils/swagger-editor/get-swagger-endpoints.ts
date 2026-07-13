import type { OpenApiDocument } from '@/types';

import { isRecord } from './is-record';

const HTTP_METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace']);
const PARAMETER_LOCATIONS = new Set(['cookie', 'header', 'path', 'query']);

export type SwaggerEndpoint = {
  description: string;
  method: string;
  operationId: string;
  parameters: SwaggerEndpointParameter[];
  path: string;
  requestBody: null | SwaggerEndpointRequestBody;
  responses: SwaggerEndpointResponse[];
  serverUrl: string;
  summary: string;
};

export type SwaggerEndpointParameter = {
  description: string;
  in: SwaggerEndpointParameterLocation;
  name: string;
  required: boolean;
  schema: string;
};

export type SwaggerEndpointParameterLocation = 'cookie' | 'header' | 'path' | 'query';

export type SwaggerEndpointRequestBody = {
  contentTypes: string[];
  description: string;
  examples: string[];
  required: boolean;
  schema: string;
};

export type SwaggerEndpointResponse = {
  contentTypes: string[];
  description: string;
  examples: string[];
  schema: string;
  statusCode: string;
};

type OperationObject = {
  consumes?: unknown;
  description?: string;
  operationId?: string;
  parameters?: unknown;
  requestBody?: unknown;
  responses?: unknown;
  summary?: string;
};

export function getSwaggerEndpoints(schema: null | OpenApiDocument): SwaggerEndpoint[] {
  if (!schema || typeof schema.paths !== 'object' || schema.paths === null) {
    return [];
  }

  const paths = schema.paths as Record<string, unknown>;
  const serverUrl = getDefaultServerUrl(schema);

  return Object.entries(paths).flatMap(([path, pathItem]) => {
    if (!isRecord(pathItem)) {
      return [];
    }

    const pathParameters = getParameters(pathItem.parameters);

    return Object.entries(pathItem)
      .filter(([method]) => HTTP_METHODS.has(method.toLowerCase()))
      .map(([method, operation]) => {
        const operationObject = isRecord(operation) ? (operation as OperationObject) : {};
        const operationParameters = getParameters(operationObject.parameters);
        const parameters = mergeParameters(pathParameters, operationParameters);
        const requestBody =
          getRequestBody(operationObject.requestBody) ??
          getSwagger2RequestBody(operationObject.parameters, operationObject.consumes);
        const operationId = getString(operationObject.operationId);

        return {
          description: getString(operationObject.description),
          method: method.toUpperCase(),
          operationId,
          parameters,
          path,
          requestBody,
          responses: getResponses(operationObject.responses),
          serverUrl,
          summary: getString(operationObject.summary) || operationId || 'No summary',
        };
      });
  });
}

function formatExample(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value === undefined) {
    return '';
  }

  return JSON.stringify(value);
}

function getContentDetails(content: unknown) {
  if (!isRecord(content)) {
    return {
      contentTypes: [],
      examples: [],
      schema: '',
    };
  }

  const contentTypes = Object.keys(content);
  const schemas = Object.values(content)
    .map((mediaType) => (isRecord(mediaType) ? stringifySchema(mediaType.schema) : ''))
    .filter(Boolean);
  const examples = Object.values(content).flatMap((mediaType) =>
    isRecord(mediaType) ? getMediaTypeExamples(mediaType) : [],
  );

  return {
    contentTypes,
    examples,
    schema: schemas[0] ?? '',
  };
}

function getDefaultServerUrl(schema: OpenApiDocument) {
  const schemaRecord = schema as Record<string, unknown>;
  const servers = schemaRecord.servers;

  if (Array.isArray(servers)) {
    const firstServer = servers.find((server) => isRecord(server) && getString(server.url));

    if (isRecord(firstServer)) {
      return getString(firstServer.url);
    }
  }

  const host = getString(schemaRecord.host);

  if (!host) {
    return '';
  }

  const schemes = schemaRecord.schemes;
  const scheme = Array.isArray(schemes) && typeof schemes[0] === 'string' ? schemes[0] : 'https';
  const basePath = getString(schemaRecord.basePath);

  return `${scheme}://${host}${basePath}`;
}

function getMediaTypeExamples(mediaType: Record<string, unknown>) {
  const examples: string[] = [];

  if ('example' in mediaType) {
    examples.push(formatExample(mediaType.example));
  }

  if (isRecord(mediaType.examples)) {
    examples.push(
      ...Object.values(mediaType.examples).map((example) =>
        isRecord(example) && 'value' in example
          ? formatExample(example.value)
          : formatExample(example),
      ),
    );
  }

  return examples.filter(Boolean);
}

function getParameters(value: unknown): SwaggerEndpointParameter[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((parameter) => {
    if (!isRecord(parameter)) {
      return [];
    }

    const location = getString(parameter.in);
    const name = getString(parameter.name);

    if (!PARAMETER_LOCATIONS.has(location) || !name) {
      return [];
    }

    return [
      {
        description: getString(parameter.description),
        in: location as SwaggerEndpointParameterLocation,
        name,
        required: parameter.required === true,
        schema: stringifySchema(parameter.schema ?? parameter),
      },
    ];
  });
}

function getRequestBody(value: unknown): null | SwaggerEndpointRequestBody {
  if (!isRecord(value)) {
    return null;
  }

  const contentDetails = getContentDetails(value.content);

  return {
    contentTypes: contentDetails.contentTypes,
    description: getString(value.description),
    examples: contentDetails.examples,
    required: value.required === true,
    schema: contentDetails.schema || stringifySchema(value),
  };
}

function getResponses(value: unknown): SwaggerEndpointResponse[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).map(([statusCode, response]) => {
    if (!isRecord(response)) {
      return {
        contentTypes: [],
        description: '',
        examples: [],
        schema: '',
        statusCode,
      };
    }

    const contentDetails = getContentDetails(response.content);
    const swagger2Examples = isRecord(response.examples)
      ? Object.values(response.examples).map(formatExample).filter(Boolean)
      : [];

    return {
      contentTypes: contentDetails.contentTypes,
      description: getString(response.description),
      examples: [...contentDetails.examples, ...swagger2Examples],
      schema: contentDetails.schema || stringifySchema(response.schema),
      statusCode,
    };
  });
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getSwagger2RequestBody(
  parameters: unknown,
  consumes: unknown,
): null | SwaggerEndpointRequestBody {
  if (!Array.isArray(parameters)) {
    return null;
  }

  const bodyParameter = parameters.find(
    (parameter) => isRecord(parameter) && parameter.in === 'body',
  );

  if (!isRecord(bodyParameter)) {
    return null;
  }

  return {
    contentTypes: Array.isArray(consumes)
      ? consumes.filter((item): item is string => typeof item === 'string')
      : [],
    description: getString(bodyParameter.description),
    examples: [],
    required: bodyParameter.required === true,
    schema: stringifySchema(bodyParameter.schema),
  };
}

function mergeParameters(
  pathParameters: SwaggerEndpointParameter[],
  operationParameters: SwaggerEndpointParameter[],
) {
  const parameterMap = new Map<string, SwaggerEndpointParameter>();

  for (const parameter of [...pathParameters, ...operationParameters]) {
    parameterMap.set(`${parameter.in}:${parameter.name}`, parameter);
  }

  return Array.from(parameterMap.values());
}

function stringifySchema(value: unknown): string {
  if (!isRecord(value)) {
    return '';
  }

  const reference = getString(value.$ref);

  if (reference) {
    return reference;
  }

  const type = getString(value.type);
  const format = getString(value.format);

  if (type === 'array') {
    const itemSchema = stringifySchema(value.items);

    return itemSchema ? `array<${itemSchema}>` : 'array';
  }

  if (isRecord(value.properties)) {
    const properties = Object.keys(value.properties);

    return properties.length > 0 ? `object { ${properties.join(', ')} }` : 'object';
  }

  if (Array.isArray(value.enum)) {
    return `enum: ${value.enum.map(String).join(', ')}`;
  }

  if (type) {
    return format ? `${type} (${format})` : type;
  }

  if (Array.isArray(value.oneOf)) {
    return `oneOf (${value.oneOf.length})`;
  }

  if (Array.isArray(value.anyOf)) {
    return `anyOf (${value.anyOf.length})`;
  }

  if (Array.isArray(value.allOf)) {
    return `allOf (${value.allOf.length})`;
  }

  return '';
}
