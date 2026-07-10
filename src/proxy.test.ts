import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls getClaims to refresh the auth session', async () => {
    const request = new NextRequest('https://example.com/en');

    await proxy(request);

    const mockClient = vi.mocked(createServerClient).mock.results[0].value;
    expect(mockClient.auth.getClaims).toHaveBeenCalled();
  });

  it('passes the request through when the route is not an auth route', async () => {
    const request = new NextRequest('https://example.com/en');

    const response = await proxy(request);

    expect(response).toBeDefined();
  });

  it('logs the error when getClaims fails', async () => {
    const testError = new Error('token expired');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: null, error: testError }),
      },
    });

    const request = new NextRequest('https://example.com/en');

    await proxy(request);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to refresh Supabase session in proxy:',
      testError,
    );
  });

  it('redirects authenticated users away from sign-in route', async () => {
    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { sub: 'user-id' }, error: null }),
      },
    });

    const request = new NextRequest('https://example.com/en/sign-in');

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('https://example.com/');
  });

  it('redirects authenticated users away from sign-up route', async () => {
    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: {
        getClaims: vi.fn().mockResolvedValue({ data: { sub: 'user-id' }, error: null }),
      },
    });

    const request = new NextRequest('https://example.com/en/sign-up');

    const response = await proxy(request);

    expect(response.status).toBe(307);
  });

  it('does not redirect unauthenticated users on sign-in route', async () => {
    const request = new NextRequest('https://example.com/en/sign-in');

    const response = await proxy(request);

    expect(response.status).not.toBe(307);
  });

  it('setAll writes cookies to the request and applies response headers', async () => {
    vi.mocked(createServerClient).mockClear();

    const request = new NextRequest('https://example.com/en');
    const response = await proxy(request);

    const calls = vi.mocked(createServerClient).mock.calls;
    const [, , options] = calls[calls.length - 1];

    const cookiesToSet = [{ name: 'session', options: { httpOnly: true }, value: 'token' }];
    const responseHeaders = { 'cache-control': 'no-store' };

    options.cookies.setAll?.(cookiesToSet, responseHeaders);

    expect(request.cookies.get('session')?.value).toBe('token');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
