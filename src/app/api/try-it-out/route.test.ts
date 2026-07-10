import { lookup } from 'node:dns/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

const mocks = vi.hoisted(() => ({
  lookup: vi.fn(),
}));

vi.mock('node:dns/promises', () => ({
  default: {
    lookup: mocks.lookup,
  },
  lookup: mocks.lookup,
}));

const lookupMock = vi.mocked(lookup);

describe('try-it-out route', () => {
  beforeEach(() => {
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('executes a request and returns response details', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', {
        headers: { 'content-type': 'application/json' },
        status: 201,
        statusText: 'Created',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          body: '{"name":"Ada"}',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'session=token',
            Host: 'ignored.example.com',
          },
          method: 'post',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].toString()).toBe('https://api.example.com/users');

    const requestOptions = fetchMock.mock.calls[0][1] as {
      body: string;
      headers: Headers;
      method: string;
      redirect: string;
      signal: AbortSignal;
    };
    const requestHeaders = requestOptions.headers;

    expect(requestOptions.body).toBe('{"name":"Ada"}');
    expect(requestOptions.method).toBe('POST');
    expect(requestOptions.redirect).toBe('manual');
    expect(requestOptions.signal).toBeInstanceOf(AbortSignal);
    expect(requestHeaders.get('Content-Type')).toBe('application/json');
    expect(requestHeaders.get('Cookie')).toBe('session=token');
    expect(requestHeaders.get('Host')).toBeNull();
    expect(payload).toMatchObject({
      body: '{"ok":true}',
      headers: { 'content-type': 'application/json' },
      status: 201,
      statusText: 'Created',
    });
    expect(typeof payload.durationMs).toBe('number');
  });

  it('rejects invalid payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'POST',
          url: 'ftp://api.example.com/users',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      errorCode: 'invalidUrl',
    });
  });

  it('blocks private destinations before fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'http://127.0.0.1/admin',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      errorCode: 'blockedUrl',
    });
  });

  it('returns a transport error when the proxied request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ errorCode: 'requestFailed' });
  });

  it('follows only validated redirects', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('', {
          headers: { location: 'https://api.example.com/redirected' },
          status: 302,
        }),
      )
      .mockResolvedValueOnce(new Response('redirected', { status: 200, statusText: 'OK' }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0].toString()).toBe('https://api.example.com/redirected');
    expect(payload.body).toBe('redirected');
  });

  it('blocks redirects to private destinations', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('', {
        headers: { location: 'http://127.0.0.1/admin' },
        status: 302,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({ errorCode: 'blockedUrl' });
  });

  it('returns a timeout error when the proxied request hangs', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: URL, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              const error = new Error('aborted');
              error.name = 'AbortError';
              reject(error);
            });
          }),
      ),
    );

    const responsePromise = POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );

    await vi.advanceTimersByTimeAsync(15_000);

    const response = await responsePromise;

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({ errorCode: 'timeout' });
  });
});
