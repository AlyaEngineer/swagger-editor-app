import type { RequestOptions } from 'node:http';

import { lookup } from 'node:dns/promises';
import { EventEmitter } from 'node:events';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { POST } from './route';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  getUser: vi.fn(),
  httpRequest: vi.fn(),
  httpsRequest: vi.fn(),
  insert: vi.fn(),
  lookup: vi.fn(),
  requests: [] as Array<{
    options: RequestOptions;
    request: EventEmitter & {
      destroy: ReturnType<typeof vi.fn>;
      end: ReturnType<typeof vi.fn>;
      write: ReturnType<typeof vi.fn>;
    };
  }>,
}));

vi.mock('node:dns/promises', () => ({
  default: {
    lookup: mocks.lookup,
  },
  lookup: mocks.lookup,
}));

vi.mock('node:http', () => ({
  default: {
    request: mocks.httpRequest,
  },
  request: mocks.httpRequest,
}));

vi.mock('node:https', () => ({
  default: {
    request: mocks.httpsRequest,
  },
  request: mocks.httpsRequest,
}));

vi.mock('@/lib/server', () => ({
  createClient: mocks.createClient,
}));

type MockedLookup = Mock<
  (
    hostname: string,
    options: { all: true; verbatim: true },
  ) => Promise<Array<{ address: string; family: number }>>
>;

type MockedNodeRequest = Mock<
  (
    options: RequestOptions,
    callback?: (response: EventEmitter) => void,
  ) => EventEmitter & {
    destroy: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
  }
>;

const httpRequestMock = vi.mocked(httpRequest) as unknown as MockedNodeRequest;
const httpsRequestMock = vi.mocked(httpsRequest) as unknown as MockedNodeRequest;
const lookupMock = vi.mocked(lookup) as unknown as MockedLookup;

describe('try-it-out route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requests = [];
    queuedResponses.length = 0;
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.createClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
      from: mocks.from,
    });
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    httpsRequestMock.mockImplementation(createRequestImplementation());
    httpRequestMock.mockImplementation(createRequestImplementation());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('executes a request through a pinned public IP and returns response details', async () => {
    queueResponse({
      body: '{"ok":true}',
      headers: { 'content-type': 'application/json' },
      status: 201,
      statusText: 'Created',
    });

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
    const request = mocks.requests[0];

    expect(response.status).toBe(200);
    expect(httpsRequestMock).toHaveBeenCalledTimes(1);
    expect(request.options).toMatchObject({
      hostname: 'api.example.com',
      method: 'POST',
      path: '/users',
      protocol: 'https:',
    });
    expect(request.options.headers).toEqual({
      'content-type': 'application/json',
      cookie: 'session=token',
    });
    expect(request.request.write).toHaveBeenCalledWith('{"name":"Ada"}');
    expect(request.options.lookup).toBeTypeOf('function');

    await expectPinnedLookup(request.options, 'api.example.com', '93.184.216.34', 4);
    expect(payload).toMatchObject({
      body: '{"ok":true}',
      headers: { 'content-type': 'application/json' },
      status: 201,
      statusText: 'Created',
    });
    expect(typeof payload.durationMs).toBe('number');
    expect(mocks.from).toHaveBeenCalledWith('request_history');
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'https://api.example.com/users',
        error_details: null,
        method: 'POST',
        request_size: Buffer.byteLength('{"name":"Ada"}', 'utf8'),
        response_size: Buffer.byteLength('{"ok":true}', 'utf8'),
        status_code: 201,
        user_id: 'user-id',
      }),
    );
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
    expect(mocks.insert).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      errorCode: 'invalidUrl',
    });
  });

  it('executes the request for an unauthenticated user without recording history', async () => {
    mocks.getUser.mockResolvedValueOnce({ data: { user: null } });
    queueResponse({
      body: 'ok',
      status: 200,
    });

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(httpsRequestMock).toHaveBeenCalledTimes(1);
    expect(mocks.insert).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ body: 'ok' });
  });

  it('does not record history for an unauthenticated user even when the request is blocked', async () => {
    mocks.getUser.mockResolvedValueOnce({ data: { user: null } });

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
    expect(mocks.insert).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ errorCode: 'blockedUrl' });
  });

  it('redacts credentials and sensitive query values before storing history', async () => {
    queueResponse({
      body: 'ok',
      status: 200,
    });

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'https://user:pass@api.example.com/users?access_token=secret&search=ada',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.requests[0].options.path).toBe('/users?access_token=secret&search=ada');
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'https://api.example.com/users?access_token=%5Bredacted%5D&search=ada',
      }),
    );
  });

  it('blocks private destinations before creating a request', async () => {
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
    expect(httpRequestMock).not.toHaveBeenCalled();
    expect(httpsRequestMock).not.toHaveBeenCalled();
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'http://127.0.0.1/admin',
        error_details: 'blockedUrl',
        method: 'GET',
        status_code: 400,
        user_id: 'user-id',
      }),
    );
    await expect(response.json()).resolves.toEqual({
      errorCode: 'blockedUrl',
    });
  });

  it('blocks IPv6 link-local destinations from the whole fe80::/10 range', async () => {
    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'http://[febf::1]/admin',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
    expect(httpRequestMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ errorCode: 'blockedUrl' });
  });

  it('returns a transport error when the proxied request fails', async () => {
    httpsRequestMock.mockImplementation(() => {
      const request = createRequestMessage();

      request.end.mockImplementation(() => {
        request.emit('error', new Error('network'));
        request.emit('close');
        return request;
      });

      return request;
    });

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
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: 'https://api.example.com/users',
        error_details: 'requestFailed',
        method: 'GET',
        status_code: 502,
        user_id: 'user-id',
      }),
    );
    await expect(response.json()).resolves.toEqual({ errorCode: 'requestFailed' });
  });

  it('returns a transport error when the proxied response stream fails', async () => {
    httpsRequestMock.mockImplementation((options, callback) => {
      const request = createRequestMessage();

      mocks.requests.push({ options, request });
      request.end.mockImplementation(() => {
        const response = createResponseMessage({ status: 200 });

        callback?.(response);
        response.emit('error', new Error('stream'));
        request.emit('close');

        return request;
      });

      return request;
    });

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

  it('rejects incomplete upstream closes before the end event', async () => {
    httpsRequestMock.mockImplementation((options, callback) => {
      const request = createRequestMessage();

      mocks.requests.push({ options, request });
      request.end.mockImplementation(() => {
        const response = createResponseMessage({ status: 200 });

        callback?.(response);
        response.emit('data', Buffer.from('partial'));
        response.emit('close');
        request.emit('close');

        return request;
      });

      return request;
    });

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

  it('aborts overly large proxied responses before buffering them fully', async () => {
    httpsRequestMock.mockImplementation((options, callback) => {
      const request = createRequestMessage();

      mocks.requests.push({ options, request });
      request.end.mockImplementation(() => {
        const response = createResponseMessage({ status: 200 });

        callback?.(response);
        response.emit('data', Buffer.alloc(5 * 1024 * 1024 + 1));

        return request;
      });

      return request;
    });

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
    expect(mocks.requests[0].request.destroy.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        error_details: 'requestFailed',
        response_size: 0,
        status_code: 502,
      }),
    );
    await expect(response.json()).resolves.toEqual({ errorCode: 'requestFailed' });
  });

  it('follows only validated redirects', async () => {
    queueResponse({
      headers: { location: 'https://api.example.com/redirected' },
      status: 302,
    });
    queueResponse({
      body: 'redirected',
      status: 200,
      statusText: 'OK',
    });

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
    expect(httpsRequestMock).toHaveBeenCalledTimes(2);
    expect(mocks.requests[1].options.path).toBe('/redirected');
    expect(payload.body).toBe('redirected');
  });

  it('blocks cross-origin redirects without replaying the request body or credentials', async () => {
    queueResponse({
      headers: { location: 'https://evil.example.com/capture' },
      status: 302,
    });

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          body: '{"secret":"value"}',
          headers: {
            Authorization: 'Bearer secret',
          },
          method: 'POST',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
    expect(httpsRequestMock).toHaveBeenCalledTimes(1);
    expect(mocks.requests[0].request.write).toHaveBeenCalledWith('{"secret":"value"}');
    await expect(response.json()).resolves.toEqual({ errorCode: 'blockedUrl' });
  });

  it('blocks redirects to private destinations', async () => {
    queueResponse({
      headers: { location: 'http://127.0.0.1/admin' },
      status: 302,
    });

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
    expect(httpsRequestMock).toHaveBeenCalledTimes(1);
    expect(httpRequestMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ errorCode: 'blockedUrl' });
  });

  it('applies the timeout to DNS resolution', async () => {
    vi.useFakeTimers();
    lookupMock.mockImplementation(() => new Promise(() => {}));

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
    expect(httpsRequestMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ errorCode: 'timeout' });
  });

  it('keeps request execution successful when history insert returns an error result', async () => {
    mocks.insert.mockResolvedValueOnce({ error: { message: 'rls' } });
    queueResponse({
      body: 'ok',
      status: 200,
    });

    const response = await POST(
      new Request('http://localhost/api/try-it-out', {
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/users',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.insert).toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({ body: 'ok' });
  });

  it('returns a timeout error when the proxied request hangs', async () => {
    vi.useFakeTimers();
    httpsRequestMock.mockImplementation((options) => {
      const request = createRequestMessage();

      mocks.requests.push({ options, request });

      return request;
    });

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
    expect(mocks.requests[0].request.destroy).toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ errorCode: 'timeout' });
  });
});

type QueuedResponse = {
  body?: string;
  headers?: Record<string, string>;
  status: number;
  statusText?: string;
};

function createRequestImplementation() {
  return (options: RequestOptions, callback?: (response: EventEmitter) => void) => {
    const request = createRequestMessage();
    const response = queuedResponses.shift() ?? { status: 200 };

    mocks.requests.push({ options, request });
    request.end.mockImplementation(() => {
      const responseMessage = createResponseMessage(response);

      callback?.(responseMessage);
      if (response.body) {
        responseMessage.emit('data', Buffer.from(response.body));
      }
      responseMessage.emit('end');
      request.emit('close');

      return request;
    });

    return request;
  };
}

const queuedResponses: QueuedResponse[] = [];

function createRequestMessage() {
  const request = new EventEmitter() as EventEmitter & {
    destroy: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
  };

  request.destroy = vi.fn((error?: Error) => {
    if (error) {
      request.emit('error', error);
    }
    request.emit('close');

    return request;
  });
  request.end = vi.fn(() => request);
  request.write = vi.fn(() => true);

  return request;
}

function createResponseMessage(response: QueuedResponse) {
  const responseMessage = new EventEmitter() as EventEmitter & {
    headers: Record<string, string>;
    statusCode: number;
    statusMessage: string;
  };

  responseMessage.headers = response.headers ?? {};
  responseMessage.statusCode = response.status;
  responseMessage.statusMessage = response.statusText ?? '';

  return responseMessage;
}

async function expectPinnedLookup(
  options: RequestOptions,
  hostname: string,
  expectedAddress: string,
  expectedFamily: 4 | 6,
) {
  await new Promise<void>((resolve, reject) => {
    options.lookup?.(hostname, {}, (error, address, family) => {
      if (error) {
        reject(error);
        return;
      }

      expect(address).toBe(expectedAddress);
      expect(family).toBe(expectedFamily);
      resolve();
    });
  });
}

function queueResponse(response: QueuedResponse) {
  queuedResponses.push(response);
}
