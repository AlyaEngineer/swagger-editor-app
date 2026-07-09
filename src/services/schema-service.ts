import { isRecord } from '@/utils/swagger-editor/is-record';
import { SchemaFormat } from '@/utils/swagger-editor/schema-types';

type RestoredSchema = {
  content: string;
  format: SchemaFormat;
};

interface SchemaServiceInterface {
  restore(signal?: AbortSignal): Promise<null | RestoredSchema>;
  save(params: { content: string; format: SchemaFormat; signal: AbortSignal }): Promise<void>;
}

function isRestoredSchema(value: unknown): value is RestoredSchema {
  return (
    isRecord(value) &&
    typeof value.content === 'string' &&
    (value.format === 'json' || value.format === 'yaml')
  );
}

export const SchemaService: SchemaServiceInterface = {
  async restore(signal?: AbortSignal): Promise<null | RestoredSchema> {
    const response = await fetch('/api/schema', { signal });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!isRecord(data)) {
      return null;
    }

    return isRestoredSchema(data.schema) ? data.schema : null;
  },

  async save({ content, format, signal }): Promise<void> {
    const response = await fetch('/api/schema', {
      body: JSON.stringify({ content, format }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    });

    if (!response.ok) {
      throw new Error('Failed to save schema');
    }
  },
};
