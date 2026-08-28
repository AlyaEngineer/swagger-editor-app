import type { createClient } from '@/lib/server';

import { withTimeout } from '@/utils/network/with-timeout';

const HISTORY_TIMEOUT_MS = 1_000;
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

export type RequestHistoryData = {
  durationMs: number;
  endpoint: string;
  errorDetails: null | string;
  method: string;
  requestSize: number;
  responseSize: number;
  statusCode: number;
};

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function getHistoryEndpoint(url: URL) {
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

export async function getUserId(supabase: SupabaseServerClient) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function saveRequestHistorySafely(
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

function isSensitiveQueryKey(key: string) {
  const normalizedKey = key.toLowerCase();

  return SENSITIVE_QUERY_KEYS.some((sensitiveKey) => normalizedKey.includes(sensitiveKey));
}
