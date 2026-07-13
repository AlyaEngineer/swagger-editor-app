import type { IncomingHttpHeaders, RequestOptions } from 'node:http';

import { lookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';

import { createClient } from '@/lib/server';

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
const HISTORY_TIMEOUT_MS = 1_000;
const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const SENSITIVE_QUERY_KEYS = [
  'access_token',
  'api_key',
  'apikey',
  'auth',
  'authorization',
  'client_secret',
  'code',
  'cookie',
  'jwt',
  'key',
  'password',
  'refresh_token',
  'secret',
  'session',
  'signature',
  'token',
];

export const runtime = 'nodejs';

type ProxiedResponse = {
  body: string;
  headers: Record<string, string>;
  status: number;
  statusText: string;
};

type RequestHistoryData = {
  durationMs: number;
  endpoint: string;
  errorDetails: null | string;
  method: string;
  requestSize: number;
  responseSize: number;
  statusCode: number;
};

type ResolvedAddress = {
  address: string;
  family: 4 | 6;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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

  const requestBody = method === 'GET' || method === 'HEAD' ? undefined : getBody(payload.body);
  const historyEndpoint = getHistoryEndpoint(url);
  const startedAt = performance.now();
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return getErrorResponse('unauthorized', 401);
  }

  try {
    const response = await fetchValidatedUrl(url, {
      body: requestBody,
      headers: getHeaders(payload.headers),
      method,
    });
    const durationMs = Math.round(performance.now() - startedAt);

    await saveRequestHistorySafely(
      {
        durationMs,
        endpoint: historyEndpoint,
        errorDetails: null,
        method,
        requestSize: getTextSize(requestBody),
        responseSize: getTextSize(response.body),
        statusCode: response.status,
      },
      supabase,
      userId,
    );

    return Response.json({
      body: response.body,
      durationMs,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    if (error instanceof BlockedUrlError) {
      return getTrackedErrorResponse(
        'blockedUrl',
        400,
        startedAt,
        historyEndpoint,
        method,
        requestBody,
        supabase,
        userId,
      );
    }

    if (error instanceof RequestTimeoutError) {
      return getTrackedErrorResponse(
        'timeout',
        504,
        startedAt,
        historyEndpoint,
        method,
        requestBody,
        supabase,
        userId,
      );
    }

    return getTrackedErrorResponse(
      'requestFailed',
      502,
      startedAt,
      historyEndpoint,
      method,
      requestBody,
      supabase,
      userId,
    );
  }
}

async function fetchValidatedUrl(url: URL, init: RequestInit) {
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const address = await resolvePublicAddress(currentUrl);
    const response = await requestWithPinnedIp(currentUrl, init, address);
    const location = response.headers.location;

    if (!isRedirect(response.status) || !location) {
      return response;
    }

    const redirectUrl = new URL(location, currentUrl);

    if (redirectUrl.origin !== currentUrl.origin) {
      throw new BlockedUrlError();
    }

    currentUrl = redirectUrl;
  }

  throw new BlockedUrlError();
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

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value ?? '';
}

function getHistoryEndpoint(url: URL) {
  const sanitizedUrl = new URL(url);

  sanitizedUrl.username = '';
  sanitizedUrl.password = '';

  for (const key of [...sanitizedUrl.searchParams.keys()]) {
    if (isSensitiveQueryKey(key)) {
      sanitizedUrl.searchParams.set(key, '[redacted]');
    }
  }

  return sanitizedUrl.toString();
}

function getHostname(url: URL) {
  return url.hostname.replace(/^\[/, '').replace(/\]$/, '');
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

function getTextSize(value: string | undefined) {
  return value ? Buffer.byteLength(value, 'utf8') : 0;
}

async function getTrackedErrorResponse(
  errorCode: string,
  status: number,
  startedAt: number,
  endpoint: string,
  method: string,
  requestBody: string | undefined,
  supabase: SupabaseServerClient,
  userId: string,
) {
  await saveRequestHistorySafely(
    {
      durationMs: Math.round(performance.now() - startedAt),
      endpoint,
      errorDetails: errorCode,
      method,
      requestSize: getTextSize(requestBody),
      responseSize: 0,
      statusCode: status,
    },
    supabase,
    userId,
  );

  return getErrorResponse(errorCode, status);
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

async function getUserId(supabase: SupabaseServerClient) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id ?? null;
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
      /^fe[89ab][0-9a-f]:/.test(normalizedAddress) ||
      normalizedAddress.startsWith('ff')
    );
  }

  return false;
}

function isRedirect(status: number) {
  return status >= 300 && status < 400;
}

function isSensitiveQueryKey(key: string) {
  const normalizedKey = key.toLowerCase();

  return SENSITIVE_QUERY_KEYS.some((sensitiveKey) => normalizedKey.includes(sensitiveKey));
}

async function lookupWithTimeout(hostname: string) {
  return withTimeout(lookup(hostname, { all: true, verbatim: true }), REQUEST_TIMEOUT_MS);
}

function normalizeHeaders(headers: IncomingHttpHeaders) {
  return Object.fromEntries(
    Object.entries(headers)
      .map(([key, value]) => [key, getHeaderValue(value)])
      .filter(([, value]) => value),
  );
}

async function requestWithPinnedIp(
  url: URL,
  init: RequestInit,
  resolvedAddress: ResolvedAddress,
): Promise<ProxiedResponse> {
  const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const headers = init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : {};
  const body = typeof init.body === 'string' ? init.body : undefined;
  const options: RequestOptions = {
    headers,
    hostname: getHostname(url),
    lookup: (_hostname, _options, callback) => {
      callback(null, resolvedAddress.address, resolvedAddress.family);
    },
    method: init.method,
    path: `${url.pathname}${url.search}`,
    port: url.port,
    protocol: url.protocol,
  };

  return new Promise((resolve, reject) => {
    let isSettled = false;

    const rejectOnce = (error: Error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      reject(error);
    };

    const resolveOnce = (response: ProxiedResponse) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve(response);
    };

    const requestMessage = request(options, (response) => {
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      response.on('close', () => {
        rejectOnce(new Error('Response closed before completion'));
      });
      response.on('error', rejectOnce);
      response.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;

        if (totalBytes > MAX_RESPONSE_BYTES) {
          rejectOnce(new Error('Response body exceeded the allowed size'));
          requestMessage.destroy(new Error('Response body exceeded the allowed size'));
          return;
        }

        chunks.push(chunk);
      });
      response.on('end', () => {
        resolveOnce({
          body: Buffer.concat(chunks).toString('utf8'),
          headers: normalizeHeaders(response.headers),
          status: response.statusCode ?? 0,
          statusText: response.statusMessage ?? '',
        });
      });
    });

    const timeout = setTimeout(() => {
      requestMessage.destroy(new RequestTimeoutError());
    }, REQUEST_TIMEOUT_MS);

    requestMessage.on('error', rejectOnce);
    requestMessage.on('close', () => {
      clearTimeout(timeout);
    });

    if (body) {
      requestMessage.write(body);
    }

    requestMessage.end();
  });
}

async function resolvePublicAddress(url: URL): Promise<ResolvedAddress> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError();
  }

  const hostname = getHostname(url);
  const ipVersion = isIP(hostname);
  const addresses =
    ipVersion === 0
      ? await lookupWithTimeout(hostname)
      : [{ address: hostname, family: ipVersion }];

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new BlockedUrlError();
  }

  return addresses[0] as ResolvedAddress;
}

async function saveRequestHistorySafely(
  data: RequestHistoryData,
  supabase: SupabaseServerClient,
  userId: string,
) {
  try {
    const { error } = await withTimeout(
      supabase.from('request_history').insert({
        duration_ms: data.durationMs,
        endpoint: data.endpoint,
        error_details: data.errorDetails,
        method: data.method,
        request_size: data.requestSize,
        response_size: data.responseSize,
        status_code: data.statusCode,
        user_id: userId,
      }),
      HISTORY_TIMEOUT_MS,
    );

    if (error) {
      return;
    }
  } catch {
    // Request execution should not fail if optional history persistence is unavailable.
  }
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => {
          reject(new RequestTimeoutError());
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
