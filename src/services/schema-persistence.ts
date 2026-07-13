import { isRecord } from '@/utils/swagger-editor/is-record';
import { type SchemaFormat } from '@/utils/swagger-editor/schema-types';

export const SAVED_SCHEMAS_TABLE = 'schemas';

export type SavedSchema = {
  content: string;
  format: SchemaFormat;
};

export function isSavedSchema(value: unknown): value is SavedSchema {
  return (
    isRecord(value) &&
    typeof value.content === 'string' &&
    (value.format === 'json' || value.format === 'yaml')
  );
}
