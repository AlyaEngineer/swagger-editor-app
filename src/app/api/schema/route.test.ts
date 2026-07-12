import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

const mockSaveSchemaForCurrentUser = vi.fn();

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
      content: 'openapi: 3.0.0\ninfo:\n  title: Saved',
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

  it('returns unauthorized when there is no authenticated user', async () => {
    mockSaveSchemaForCurrentUser.mockResolvedValue('unauthorized');

    const response = await POST(createRequest({ content: 'openapi: 3.0.0', format: 'yaml' }));

    expect(response.status).toBe(401);
  });
});
