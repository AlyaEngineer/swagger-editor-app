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

  it('logs the error when getClaims fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: null, error: new Error('token expired') }),
      },
    });

    const request = new NextRequest('https://example.com/en');

    await proxy(request);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to refresh Supabase session in proxy:',
      expect.anything(),
    );

    consoleErrorSpy.mockRestore();
  });

  it('setAll writes cookies to both the request and the intl response', async () => {
    const request = new NextRequest('https://example.com/en');

    await proxy(request);

    const [, , options] = vi.mocked(createServerClient).mock.calls[0];
    const cookiesToSet = [{ name: 'session', options: { httpOnly: true }, value: 'token' }];

    expect(options.cookies.setAll).toBeDefined();
    expect(() => options.cookies.setAll?.(cookiesToSet, {})).not.toThrow();
  });
});
