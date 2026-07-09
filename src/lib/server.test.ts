import { createServerClient } from '@supabase/ssr';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createClient } from './server';

const TEST_SUPABASE_URL = 'https://test.supabase.co';
const TEST_SUPABASE_KEY = 'test-publishable-key';

const mockCookieStore = {
  getAll: vi.fn(() => [{ name: 'test', value: 'value' }]),
  set: vi.fn(),
};

const mockClient = { auth: {} };

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockClient),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createClient (server)', () => {
  it('calls createServerClient with the Supabase URL, key, and cookie handlers, and returns the client', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', TEST_SUPABASE_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', TEST_SUPABASE_KEY);

    const result = await createClient();

    const [url, key, options] = vi.mocked(createServerClient).mock.calls[0];

    expect(url).toBe(TEST_SUPABASE_URL);
    expect(key).toBe(TEST_SUPABASE_KEY);
    expect(typeof options.cookies.getAll).toBe('function');
    expect(typeof options.cookies.setAll).toBe('function');
    expect(result).toBe(mockClient);
  });

  it('getAll delegates to the cookie store', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', TEST_SUPABASE_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', TEST_SUPABASE_KEY);

    await createClient();

    const [, , options] = vi.mocked(createServerClient).mock.calls[0];
    const result = options.cookies.getAll();

    expect(mockCookieStore.getAll).toHaveBeenCalled();
    expect(result).toEqual([{ name: 'test', value: 'value' }]);
  });

  it('setAll writes each cookie to the cookie store', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', TEST_SUPABASE_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', TEST_SUPABASE_KEY);

    await createClient();

    const [, , options] = vi.mocked(createServerClient).mock.calls[0];
    const cookiesToSet = [
      { name: 'a', options: { httpOnly: true }, value: '1' },
      { name: 'b', options: {}, value: '2' },
    ];

    options.cookies.setAll?.(cookiesToSet, {});

    expect(mockCookieStore.set).toHaveBeenCalledWith('a', '1', { httpOnly: true });
    expect(mockCookieStore.set).toHaveBeenCalledWith('b', '2', {});
  });

  it('setAll swallows errors when called from a Server Component', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', TEST_SUPABASE_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', TEST_SUPABASE_KEY);

    mockCookieStore.set.mockImplementationOnce(() => {
      throw new Error('cannot set cookies from Server Component');
    });

    await createClient();

    const [, , options] = vi.mocked(createServerClient).mock.calls[0];

    expect(() =>
      options.cookies.setAll?.([{ name: 'a', options: {}, value: '1' }], {}),
    ).not.toThrow();
  });
});
