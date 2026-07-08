import { SchemaFormat } from '@/utils/swagger-editor/schema-types';

type RestoredSchema = {
  content: string;
  format: SchemaFormat;
};

interface SchemaServiceInterface {
  restore(): Promise<null | RestoredSchema>;
  save(params: { content: string; format: SchemaFormat; signal: AbortSignal }): Promise<void>;
}

export const SchemaService: SchemaServiceInterface = {
  async restore(): Promise<null | RestoredSchema> {
    const response = await fetch('/api/schema');

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data.schema?.content ? data.schema : null;
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
