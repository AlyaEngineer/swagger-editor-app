import { type SavedSchema } from './schema-persistence';

interface SchemaServiceInterface {
  save(params: SavedSchema & { signal: AbortSignal }): Promise<void>;
}

export const SchemaService: SchemaServiceInterface = {
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
