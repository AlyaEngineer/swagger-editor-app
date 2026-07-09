import { createBrowserClient } from '@supabase/ssr';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createClient } from './client';

const TEST_SUPABASE_URL = 'https://test.supabase.co';
const TEST_SUPABASE_KEY = 'test-publishable-key';

const mockClient = { auth: {} };

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockClient),
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createClient (browser)', () => {
  it('calls createBrowserClient with the Supabase URL and publishable key from env', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', TEST_SUPABASE_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', TEST_SUPABASE_KEY);

    const result = createClient();

    expect(createBrowserClient).toHaveBeenCalledWith(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);
    expect(result).toBe(mockClient);
  });
});
