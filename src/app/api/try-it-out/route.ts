import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

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
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 15_000;

type TryItOutPayload = {
  body?: unknown;
  headers?: unknown;
  method?: unknown;
  url?: unknown;
};

class BlockedUrlError extends Error {}

class RequestTimeoutError extends Error {}

export async function POST(request: Request) {
  const payload = await getPayload(request);

  if (!payload) {
    return getErrorResponse('invalidPayload', 400);
  }

  const method = getMethod(payload.method);
  const url = getUrl(payload.url);

  if (!url || !method) {
    return getErrorResponse('invalidUrl', 400);
  }

  try {
    const startedAt = performance.now();
    const response = await fetchValidatedUrl(url, {
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
  } catch (error) {
    if (error instanceof BlockedUrlError) {
      return getErrorResponse('blockedUrl', 400);
    }

    if (error instanceof RequestTimeoutError) {
      return getErrorResponse('timeout', 504);
    }

    return getErrorResponse('requestFailed', 502);
  }
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError();
  }

  const hostname = url.hostname;
  const ipVersion = isIP(hostname);
  const addresses =
    ipVersion === 0
      ? await lookup(hostname, { all: true, verbatim: true })
      : [{ address: hostname }];

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new BlockedUrlError();
  }
}

async function fetchValidatedUrl(url: URL, init: RequestInit) {
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertPublicUrl(currentUrl);

    const response = await fetchWithTimeout(currentUrl, init);
    const location = response.headers.get('location');

    if (!isRedirect(response.status) || !location) {
      return response;
    }

    currentUrl = new URL(location, currentUrl);
  }

  throw new BlockedUrlError();
}

async function fetchWithTimeout(url: URL, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      redirect: 'manual',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RequestTimeoutError();
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getBody(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getErrorResponse(errorCode: string, status: number) {
  return Response.json({ errorCode }, { status });
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
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function isPrivateIpv4(parts: number[]) {
  const [first = 0, second = 0] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    first >= 224
  );
}

function isPublicIp(address: string) {
  const ipVersion = isIP(address);

  if (ipVersion === 4) {
    return !isPrivateIpv4(address.split('.').map(Number));
  }

  if (ipVersion === 6) {
    const normalizedAddress = address.toLowerCase();

    if (normalizedAddress.startsWith('::ffff:')) {
      return isPublicIp(normalizedAddress.replace('::ffff:', ''));
    }

    return !(
      normalizedAddress === '::' ||
      normalizedAddress === '::1' ||
      normalizedAddress.startsWith('2001:db8:') ||
      normalizedAddress.startsWith('fc') ||
      normalizedAddress.startsWith('fd') ||
      normalizedAddress.startsWith('fe80:') ||
      normalizedAddress.startsWith('ff')
    );
  }

  return false;
}

function isRedirect(status: number) {
  return status >= 300 && status < 400;
}
