import type {
  SwaggerEndpoint,
  SwaggerEndpointParameter,
} from '@/utils/swagger-editor/get-swagger-endpoints';

export type TryItOutRequest = {
  body: string;
  headers: Record<string, string>;
  method: string;
  url: string;
};

export function buildCurlCommand(request: TryItOutRequest) {
  const parts = ['curl', '-X', request.method, shellQuote(request.url)];

  for (const [key, value] of Object.entries(request.headers)) {
    parts.push('-H', shellQuote(`${key}: ${value}`));
  }

  if (request.body) {
    parts.push('--data-raw', shellQuote(request.body));
  }

  return parts.join(' ');
}

export function buildTryItOutRequest(
  endpoint: SwaggerEndpoint,
  serverUrl: string,
  parameterValues: Record<string, string>,
  body: string,
) {
  try {
    const url = new URL(
      joinUrl(serverUrl, applyPathParameters(endpoint.path, endpoint.parameters, parameterValues)),
    );
    const headers: Record<string, string> = {};
    const cookieValues: string[] = [];

    for (const parameter of endpoint.parameters) {
      const value = parameterValues[getParameterKey(parameter)] ?? '';

      if (!value) {
        continue;
      }

      if (parameter.in === 'query') {
        url.searchParams.set(parameter.name, value);
      }

      if (parameter.in === 'header') {
        headers[parameter.name] = value;
      }

      if (parameter.in === 'cookie') {
        cookieValues.push(`${parameter.name}=${value}`);
      }
    }

    if (cookieValues.length > 0) {
      headers.Cookie = cookieValues.join('; ');
    }

    if (endpoint.requestBody?.contentTypes[0]) {
      headers['Content-Type'] = endpoint.requestBody.contentTypes[0];
    }

    return {
      body,
      headers,
      method: endpoint.method,
      url: url.toString(),
    };
  } catch {
    return null;
  }
}

export function getParameterKey(parameter: SwaggerEndpointParameter) {
  return `${parameter.in}:${parameter.name}`;
}

export function getTryItOutErrorKey(errorCode: unknown) {
  switch (errorCode) {
    case 'blockedUrl':
      return 'tryItOutBlockedUrl';
    case 'invalidPayload':
      return 'tryItOutInvalidPayload';
    case 'invalidUrl':
      return 'tryItOutInvalidUrl';
    case 'timeout':
      return 'tryItOutTimeout';
    default:
      return 'tryItOutFailed';
  }
}

function applyPathParameters(
  path: string,
  parameters: SwaggerEndpointParameter[],
  parameterValues: Record<string, string>,
) {
  return parameters
    .filter((parameter) => parameter.in === 'path')
    .reduce((currentPath, parameter) => {
      const value = parameterValues[getParameterKey(parameter)] ?? '';

      return currentPath.replaceAll(`{${parameter.name}}`, encodeURIComponent(value));
    }, path);
}

function joinUrl(serverUrl: string, path: string) {
  return `${serverUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
