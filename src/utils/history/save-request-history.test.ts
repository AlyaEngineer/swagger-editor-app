import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/server';

import { saveRequestHistory } from './save-request-history';

vi.mock('@/lib/server', () => ({
  createClient: vi.fn(),
}));

describe('saveRequestHistory', () => {
  const insert = vi.fn();
  const getUser = vi.fn();

  const mockSupabase = {
    auth: {
      getUser,
    },
    from: vi.fn(() => ({
      insert,
    })),
  };

  const request = {
    durationMs: 150,
    endpoint: '/pets',
    errorDetails: null,
    method: 'GET',
    requestSize: 120,
    responseSize: 450,
    statusCode: 200,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  });

  it('saves request history for authenticated user', async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
        },
      },
    });

    insert.mockResolvedValue({ error: null });

    await saveRequestHistory(request);

    expect(mockSupabase.from).toHaveBeenCalledWith('request_history');

    expect(insert).toHaveBeenCalledWith({
      duration_ms: 150,
      endpoint: '/pets',
      error_details: null,
      method: 'GET',
      request_size: 120,
      response_size: 450,
      status_code: 200,
      user_id: 'user-id',
    });
  });

  it('does not save request history for unauthenticated user', async () => {
    getUser.mockResolvedValue({
      data: {
        user: null,
      },
    });

    await saveRequestHistory(request);

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('logs an error when insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
        },
      },
    });

    const error = new Error('Insert failed');

    insert.mockResolvedValue({ error });

    await saveRequestHistory(request);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save request history:', error);

    consoleSpy.mockRestore();
  });
});
