import { createClient } from '@/lib/server';

import { isSavedSchema, SAVED_SCHEMAS_TABLE, type SavedSchema } from './schema-persistence';

type SaveSchemaResult = 'error' | 'saved' | 'unauthorized';
type SchemaContext =
  | {
      status: 'authenticated';
      supabase: Awaited<ReturnType<typeof createClient>>;
      userId: string;
    }
  | {
      status: 'error' | 'unauthorized';
    };

export async function restoreSchemaForCurrentUser(): Promise<null | SavedSchema> {
  try {
    const context = await getCurrentUserContext();

    if (context.status !== 'authenticated') {
      return null;
    }

    const { data, error } = await context.supabase
      .from(SAVED_SCHEMAS_TABLE)
      .select('content, format')
      .eq('user_id', context.userId)
      .maybeSingle();

    if (error || !isSavedSchema(data)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function saveSchemaForCurrentUser(schema: SavedSchema): Promise<SaveSchemaResult> {
  try {
    const context = await getCurrentUserContext();

    if (context.status !== 'authenticated') {
      return context.status;
    }

    const { error } = await context.supabase.from(SAVED_SCHEMAS_TABLE).upsert(
      {
        content: schema.content,
        format: schema.format,
        updated_at: new Date().toISOString(),
        user_id: context.userId,
      },
      { onConflict: 'user_id' },
    );

    return error ? 'error' : 'saved';
  } catch {
    return 'error';
  }
}

async function getCurrentUserContext(): Promise<SchemaContext> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { status: 'error' };
    }

    if (!data.user) {
      return { status: 'unauthorized' };
    }

    return { status: 'authenticated', supabase, userId: data.user.id };
  } catch {
    return { status: 'error' };
  }
}
