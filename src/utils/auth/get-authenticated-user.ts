import { unauthorized } from 'next/navigation';

import { createClient } from '@/lib/server';

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (!data || error) {
    unauthorized();
  }

  return data;
}
