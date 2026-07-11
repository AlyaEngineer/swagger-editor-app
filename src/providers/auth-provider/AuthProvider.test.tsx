import { act, renderHook, waitFor } from '@testing-library/react';

import { createClient } from '@/lib/client';

import { AuthProvider, useAuth } from './AuthProvider';

vi.mock('@/lib/client', () => ({
  createClient: vi.fn(),
}));

function mockSupabaseClient({
  authStateChangeCallback,
  user,
}: {
  authStateChangeCallback?: (event: string, session: unknown) => void;
  user: unknown;
}) {
  const unsubscribe = vi.fn();
  const signOut = vi.fn().mockResolvedValue({ error: null });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
      onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
        if (authStateChangeCallback) {
          Object.assign(authStateChangeCallback, callback);
        }
        return { data: { subscription: { unsubscribe } } };
      }),
      signOut,
    },
  } as unknown as ReturnType<typeof createClient>;
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AuthProvider', () => {
  it('sets isAuthenticated false and isAuthLoading false when there is no user', async () => {
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient({ user: null }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets isAuthenticated true when a user is present', async () => {
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient({ user: { id: 'user-id' } }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('updates isAuthenticated when onAuthStateChange fires', async () => {
    let capturedCallback: ((event: string, session: unknown) => void) | undefined;

    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
          capturedCallback = callback;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
        signOut: vi.fn(),
      },
    } as unknown as ReturnType<typeof createClient>);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthLoading).toBe(false);
    });

    act(() => {
      capturedCallback?.('SIGNED_IN', { user: { id: 'user-id' } });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('calls supabase signOut when signOut is invoked', async () => {
    const client = mockSupabaseClient({ user: { id: 'user-id' } });
    vi.mocked(createClient).mockReturnValue(client);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(client.auth.signOut).toHaveBeenCalled();
  });

  it('throws an error when useAuth is used outside AuthProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useAuth();
      } catch (error) {
        return error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toBe('useAuth must be used within AuthProvider');
  });

  it('throws when supabase signOut returns an error', async () => {
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } } }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn().mockResolvedValue({ error: new Error('sign out failed') }),
      },
    } as unknown as ReturnType<typeof createClient>);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthLoading).toBe(false);
    });

    await expect(result.current.signOut()).rejects.toThrow('sign out failed');
  });
});
