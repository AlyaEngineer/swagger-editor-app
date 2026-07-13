import { afterEach, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/server';

import { getRequestHistory } from './get-request-history';

vi.mock('@/lib/server', () => ({
  createClient: vi.fn(),
}));

function mockSupabaseClient(result: { data: unknown; error: unknown }) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue(result),
      })),
    })),
  } as unknown as ReturnType<typeof createClient>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getRequestHistory', () => {
  it('returns mapped entries sorted from the query with hasError false', async () => {
    const rows = [
      {
        created_at: '2026-07-12T09:46:10.444583+00',
        duration_ms: 245,
        endpoint: 'https://api.example.com/users',
        error_details: null,
        id: '1',
        method: 'GET',
        request_size: 0,
        response_size: 1024,
        status_code: 200,
      },
    ];

    vi.mocked(createClient).mockResolvedValue(
      await mockSupabaseClient({ data: rows, error: null }),
    );

    const result = await getRequestHistory();

    expect(result.hasError).toBe(false);
    expect(result.entries).toEqual([
      {
        createdAt: '2026-07-12T09:46:10.444583+00',
        durationMs: 245,
        endpoint: 'https://api.example.com/users',
        errorDetails: null,
        id: '1',
        method: 'GET',
        requestSize: 0,
        responseSize: 1024,
        statusCode: 200,
      },
    ]);
  });

  it('returns an empty array and hasError false when there are no rows', async () => {
    vi.mocked(createClient).mockResolvedValue(await mockSupabaseClient({ data: [], error: null }));

    const result = await getRequestHistory();

    expect(result.entries).toEqual([]);
    expect(result.hasError).toBe(false);
  });

  it('returns hasError true and logs the error when the query fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('connection failed');

    vi.mocked(createClient).mockResolvedValue(
      await mockSupabaseClient({ data: null, error: testError }),
    );

    const result = await getRequestHistory();

    expect(result.hasError).toBe(true);
    expect(result.entries).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load request history:', testError);
  });

  it('returns an empty array when data is null despite no error', async () => {
    vi.mocked(createClient).mockResolvedValue(
      await mockSupabaseClient({ data: null, error: null }),
    );

    const result = await getRequestHistory();

    expect(result.entries).toEqual([]);
    expect(result.hasError).toBe(false);
  });
});
