import { unauthorized } from 'next/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/server';

import { getAuthenticatedUser } from './get-authenticated-user';

vi.mock('next/navigation', () => ({
  unauthorized: vi.fn(),
}));

vi.mock('@/lib/server', () => ({
  createClient: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

function mockSupabaseClient(getClaimsResult: { data: unknown; error: unknown }) {
  return {
    auth: {
      getClaims: vi.fn().mockResolvedValue(getClaimsResult),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>;
}

describe('getAuthenticatedUser', () => {
  it('returns the claims data when the session is valid', async () => {
    const mockData = { sub: 'user-id' };

    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient({ data: mockData, error: null }));

    const result = await getAuthenticatedUser();

    expect(result).toBe(mockData);
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it('calls unauthorized when there is no session data', async () => {
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient({ data: null, error: null }));

    await getAuthenticatedUser();

    expect(unauthorized).toHaveBeenCalled();
  });

  it('calls unauthorized when getClaims returns an error', async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabaseClient({ data: null, error: new Error('token expired') }),
    );

    await getAuthenticatedUser();

    expect(unauthorized).toHaveBeenCalled();
  });

  it('calls unauthorized when getClaims throws unexpectedly', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockRejectedValue(new Error('network error')),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await getAuthenticatedUser();

    expect(unauthorized).toHaveBeenCalled();
  });
});
