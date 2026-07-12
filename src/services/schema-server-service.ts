import { createClient } from '@/lib/server';

import { isSavedSchema, SAVED_SCHEMAS_TABLE, type SavedSchema } from './schema-persistence';

type SaveSchemaResult = 'error' | 'saved' | 'unauthorized';

export async function restoreSchemaForCurrentUser(): Promise<null | SavedSchema> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from(SAVED_SCHEMAS_TABLE)
    .select('content, format')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !isSavedSchema(data)) {
    return null;
  }

  return data;
}

export async function saveSchemaForCurrentUser(schema: SavedSchema): Promise<SaveSchemaResult> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return 'unauthorized';
  }

  const { error } = await supabase.from(SAVED_SCHEMAS_TABLE).upsert(
    {
      content: schema.content,
      format: schema.format,
      updated_at: new Date().toISOString(),
      user_id: userId,
    },
    { onConflict: 'user_id' },
  );

  return error ? 'error' : 'saved';
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, userId: null };
  }

  return { supabase, userId: data.user.id };
}
