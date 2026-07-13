import { createClient } from '@/lib/server';

export type RequestHistoryEntry = {
  createdAt: string;
  durationMs: number;
  endpoint: string;
  errorDetails: null | string;
  id: string;
  method: string;
  requestSize: number;
  responseSize: number;
  statusCode: number;
};

export type RequestHistoryResult = {
  entries: RequestHistoryEntry[];
  hasError: boolean;
};

export async function getRequestHistory(): Promise<RequestHistoryResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('request_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load request history:', error);
    return { entries: [], hasError: true };
  }

  return {
    entries: (data ?? []).map((row) => ({
      createdAt: row.created_at,
      durationMs: row.duration_ms,
      endpoint: row.endpoint,
      errorDetails: row.error_details,
      id: row.id,
      method: row.method,
      requestSize: row.request_size,
      responseSize: row.response_size,
      statusCode: row.status_code,
    })),
    hasError: false,
  };
}
