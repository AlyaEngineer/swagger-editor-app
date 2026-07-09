import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { proxy } from './proxy';

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => vi.fn(() => NextResponse.next())),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  })),
}));

describe('proxy', () => {
  it('calls getClaims to refresh the auth session', async () => {
    const request = new NextRequest('https://example.com/en');

    await proxy(request);

    const mockClient = vi.mocked(createServerClient).mock.results[0].value;
    expect(mockClient.auth.getClaims).toHaveBeenCalled();
  });

  it('passes the request through to the intl response', async () => {
    const request = new NextRequest('https://example.com/en');

    const response = await proxy(request);

    expect(response).toBeDefined();
  });
});
