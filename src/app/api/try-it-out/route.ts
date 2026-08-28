import type { SupabaseServerClient } from '@/utils/history/request-tracking';

import { createClient } from '@/lib/server';
import {
  getHistoryEndpoint,
  getUserId,
  saveRequestHistorySafely,
} from '@/utils/history/request-tracking';
import { BlockedUrlError, RequestTimeoutError } from '@/utils/network/errors';
import { fetchValidatedUrl } from '@/utils/network/pinned-request';

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

export const runtime = 'nodejs';

type TryItOutPayload = {
  body?: unknown;
  headers?: unknown;
  method?: unknown;
  url?: unknown;
};

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

  try {
    const response = await fetchValidatedUrl(url, {
      body: requestBody,
      headers: getHeaders(payload.headers),
      method,
    });
    const durationMs = Math.round(performance.now() - startedAt);

    if (userId) {
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
    }

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
  userId: null | string,
) {
  if (userId) {
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
  }

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
