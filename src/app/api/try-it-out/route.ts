const ALLOWED_METHODS = new Set(['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT']);
const FORBIDDEN_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

type TryItOutPayload = {
  body?: unknown;
  headers?: unknown;
  method?: unknown;
  url?: unknown;
};

export async function POST(request: Request) {
  const payload = await getPayload(request);

  if (!payload) {
    return Response.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const method = getMethod(payload.method);
  const url = getUrl(payload.url);

  if (!url || !method) {
    return Response.json({ error: 'A valid HTTP URL and method are required' }, { status: 400 });
  }

  try {
    const startedAt = performance.now();
    const response = await fetch(url, {
      body: method === 'GET' || method === 'HEAD' ? undefined : getBody(payload.body),
      headers: getHeaders(payload.headers),
      method,
    });
    const responseBody = await response.text();

    return Response.json({
      body: responseBody,
      durationMs: Math.round(performance.now() - startedAt),
      headers: Object.fromEntries(response.headers.entries()),
      status: response.status,
      statusText: response.statusText,
    });
  } catch {
    return Response.json({ error: 'Request execution failed' }, { status: 502 });
  }
}

function getBody(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getHeaders(value: unknown) {
  const headers = new Headers();

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return headers;
  }

  for (const [key, headerValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();

    if (FORBIDDEN_HEADERS.has(normalizedKey)) {
      continue;
    }

    if (typeof headerValue === 'string' && headerValue) {
      headers.set(key, headerValue);
    }
  }

  return headers;
}

function getMethod(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  const method = value.toUpperCase();

  return ALLOWED_METHODS.has(method) ? method : '';
}

async function getPayload(request: Request): Promise<null | TryItOutPayload> {
  try {
    const payload = await request.json();

    return payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as TryItOutPayload)
      : null;
  } catch {
    return null;
  }
}

function getUrl(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}
