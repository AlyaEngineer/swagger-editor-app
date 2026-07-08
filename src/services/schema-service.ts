import { SchemaFormat } from '@/utils/swagger-editor/schema-types';

type SaveSchemaParams = {
  content: string;
  format: SchemaFormat;
  signal: AbortSignal;
};

export async function saveSchema({ content, format, signal }: SaveSchemaParams): Promise<void> {
  const response = await fetch('/api/schema', {
    body: JSON.stringify({ content, format }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to save schema');
  }
}
