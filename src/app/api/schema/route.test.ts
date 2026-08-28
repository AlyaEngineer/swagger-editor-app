import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

const mockSaveSchemaForCurrentUser = vi.fn();
const VALID_SCHEMA = 'openapi: 3.0.0\ninfo:\n  title: Saved\n  version: 1.0.0\npaths: {}';

vi.mock('@/services/schema-server-service', () => ({
  saveSchemaForCurrentUser: (schema: unknown) => mockSaveSchemaForCurrentUser(schema),
}));

function createRequest(payload: unknown) {
  return new Request('http://localhost/api/schema', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

describe('schema API route', () => {
  beforeEach(() => {
    mockSaveSchemaForCurrentUser.mockReset();
  });

  it('saves valid schema payloads', async () => {
    const schema = {
      content: VALID_SCHEMA,
      format: 'yaml',
    };

    mockSaveSchemaForCurrentUser.mockResolvedValue('saved');

    const response = await POST(createRequest(schema));

    expect(response.status).toBe(200);
    expect(mockSaveSchemaForCurrentUser).toHaveBeenCalledWith(schema);
  });

  it('rejects invalid payloads', async () => {
    const response = await POST(createRequest({ content: 'openapi: 3.0.0', format: 'xml' }));

    expect(response.status).toBe(400);
    expect(mockSaveSchemaForCurrentUser).not.toHaveBeenCalled();
  });

  it('rejects malformed OpenAPI content', async () => {
    const response = await POST(createRequest({ content: 'not: openapi', format: 'yaml' }));

    expect(response.status).toBe(400);
    expect(mockSaveSchemaForCurrentUser).not.toHaveBeenCalled();
  });

  it('returns unauthorized when there is no authenticated user', async () => {
    mockSaveSchemaForCurrentUser.mockResolvedValue('unauthorized');

    const response = await POST(createRequest({ content: VALID_SCHEMA, format: 'yaml' }));

    expect(response.status).toBe(401);
  });

  it('returns a server error when saving fails', async () => {
    mockSaveSchemaForCurrentUser.mockResolvedValue('error');

    const response = await POST(createRequest({ content: VALID_SCHEMA, format: 'yaml' }));

    expect(response.status).toBe(500);
  });
});
