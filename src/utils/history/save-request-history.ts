import { createClient } from '@/lib/server';

import type { SaveRequestHistoryData } from './history-types';

export async function saveRequestHistory(data: SaveRequestHistoryData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.from('request_history').insert({
    duration_ms: data.durationMs,
    endpoint: data.endpoint,
    error_details: data.errorDetails,
    method: data.method,
    request_size: data.requestSize,
    response_size: data.responseSize,
    status_code: data.statusCode,
    user_id: user.id,
  });

  if (error) {
    console.error('Failed to save request history:', error);
  }
}
