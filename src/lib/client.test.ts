import { createBrowserClient } from '@supabase/ssr';
import { describe, expect, it, vi } from 'vitest';

import { createClient } from './client';

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}));

describe('createClient (browser)', () => {
  it('calls createBrowserClient with the Supabase URL and publishable key from env', () => {
    createClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  });
});
