import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

describe('try-it-out route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.com/users');

    const requestOptions = fetchMock.mock.calls[0][1] as {
      body: string;
      headers: Headers;
      method: string;
    };
    const requestHeaders = requestOptions.headers;

    expect(requestOptions.body).toBe('{"name":"Ada"}');
    expect(requestOptions.method).toBe('POST');
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
      error: 'A valid HTTP URL and method are required',
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
    await expect(response.json()).resolves.toEqual({ error: 'Request execution failed' });
  });
});
