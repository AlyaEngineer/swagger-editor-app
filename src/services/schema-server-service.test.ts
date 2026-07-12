import { beforeEach, describe, expect, it, vi } from 'vitest';

import { restoreSchemaForCurrentUser, saveSchemaForCurrentUser } from './schema-server-service';

const mockGetUser = vi.fn();
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockUpsert = vi.fn();
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  upsert: mockUpsert,
}));

vi.mock('@/lib/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    }),
}));

describe('schema server service', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockMaybeSingle.mockReset();
    mockEq.mockClear();
    mockSelect.mockClear();
    mockUpsert.mockReset();
    mockFrom.mockClear();
  });

  it('restores the current user schema from Supabase', async () => {
    const schema = { content: 'openapi: 3.0.0', format: 'yaml' };

    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: schema, error: null });

    await expect(restoreSchemaForCurrentUser()).resolves.toEqual(schema);

    expect(mockFrom).toHaveBeenCalledWith('schemas');
    expect(mockSelect).toHaveBeenCalledWith('content, format');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('returns null when the user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(restoreSchemaForCurrentUser()).resolves.toBeNull();

    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('sends raw text and format to Supabase when saving', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });

    await expect(
      saveSchemaForCurrentUser({
        content: 'openapi: 3.0.0\n# keep comments',
        format: 'yaml',
      }),
    ).resolves.toBe('saved');

    expect(mockFrom).toHaveBeenCalledWith('schemas');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'openapi: 3.0.0\n# keep comments',
        format: 'yaml',
        user_id: 'user-1',
      }),
      { onConflict: 'user_id' },
    );
  });

  it('does not save when the user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(
      saveSchemaForCurrentUser({ content: 'openapi: 3.0.0', format: 'yaml' }),
    ).resolves.toBe('unauthorized');

    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
