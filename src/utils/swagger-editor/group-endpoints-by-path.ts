import type { SwaggerEndpoint } from './get-swagger-endpoints';

const METHOD_ORDER = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE'];

export function groupEndpointsByPath(endpoints: SwaggerEndpoint[]) {
  const groups = new Map<string, SwaggerEndpoint[]>();

  for (const endpoint of endpoints) {
    groups.set(endpoint.path, [...(groups.get(endpoint.path) ?? []), endpoint]);
  }

  return Array.from(groups.entries()).map(([path, pathEndpoints]) => ({
    endpoints: [...pathEndpoints].sort(
      (a, b) => METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method),
    ),
    path,
  }));
}
