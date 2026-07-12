import { isSavedSchema } from '@/services/schema-persistence';
import { saveSchemaForCurrentUser } from '@/services/schema-server-service';

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);

  if (!isSavedSchema(payload)) {
    return Response.json({ error: 'Invalid schema payload' }, { status: 400 });
  }

  const result = await saveSchemaForCurrentUser(payload);

  if (result === 'unauthorized') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (result === 'error') {
    return Response.json({ error: 'Failed to save schema' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
