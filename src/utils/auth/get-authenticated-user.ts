import { unauthorized } from 'next/navigation';

import { createClient } from '@/lib/server';

export async function getAuthenticatedUser() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (!data || error) {
      unauthorized();
    }

    return data;
  } catch (unexpectedError) {
    console.error('Unexpected error while checking authentication:', unexpectedError);
    unauthorized();
  }
}
