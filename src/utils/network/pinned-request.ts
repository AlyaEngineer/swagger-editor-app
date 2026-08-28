import type { IncomingHttpHeaders, RequestOptions } from 'node:http';

import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

import type { ResolvedAddress } from './ssrf-guard';

import { BlockedUrlError, RequestTimeoutError } from './errors';
import { getHostname, resolvePublicAddress } from './ssrf-guard';

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 8_000;

export type ProxiedResponse = {
  body: string;
  headers: Record<string, string>;
  status: number;
  statusText: string;
};

export async function fetchValidatedUrl(url: URL, init: RequestInit) {
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const address = await resolvePublicAddress(currentUrl);
    const response = await requestWithPinnedIp(currentUrl, init, address);
    const location = response.headers.location;

    if (!isRedirect(response.status) || !location) {
      return response;
    }

    const redirectUrl = new URL(location, currentUrl);

    if (redirectUrl.origin !== currentUrl.origin) {
      throw new BlockedUrlError();
    }

    currentUrl = redirectUrl;
  }

  throw new BlockedUrlError();
}

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value ?? '';
}

function isRedirect(status: number) {
  return status >= 300 && status < 400;
}

function normalizeHeaders(headers: IncomingHttpHeaders) {
  return Object.fromEntries(
    Object.entries(headers)
      .map(([key, value]) => [key, getHeaderValue(value)])
      .filter(([, value]) => value),
  );
}

async function requestWithPinnedIp(
  url: URL,
  init: RequestInit,
  resolvedAddress: ResolvedAddress,
): Promise<ProxiedResponse> {
  const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const headers = init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : {};
  const body = typeof init.body === 'string' ? init.body : undefined;
  const options: RequestOptions = {
    headers,
    hostname: getHostname(url),
    lookup: (_hostname, lookupOptions, callback) => {
      const wantsAll =
        typeof lookupOptions === 'object' && lookupOptions !== null && lookupOptions.all === true;

      if (wantsAll) {
        const respondWithAllAddresses = callback as (
          error: null,
          addresses: Array<{ address: string; family: number }>,
        ) => void;

        respondWithAllAddresses(null, [
          { address: resolvedAddress.address, family: resolvedAddress.family },
        ]);
        return;
      }

      const respondWithSingleAddress = callback as (
        error: null,
        address: string,
        family: number,
      ) => void;

      respondWithSingleAddress(null, resolvedAddress.address, resolvedAddress.family);
    },
    method: init.method,
    path: `${url.pathname}${url.search}`,
    port: url.port,
    protocol: url.protocol,
  };

  return new Promise((resolve, reject) => {
    let isSettled = false;

    const rejectOnce = (error: Error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      reject(error);
    };

    const resolveOnce = (response: ProxiedResponse) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve(response);
    };

    const requestMessage = request(options, (response) => {
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      response.on('close', () => {
        rejectOnce(new Error('Response closed before completion'));
      });
      response.on('error', rejectOnce);
      response.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;

        if (totalBytes > MAX_RESPONSE_BYTES) {
          rejectOnce(new Error('Response body exceeded the allowed size'));
          requestMessage.destroy(new Error('Response body exceeded the allowed size'));
          return;
        }

        chunks.push(chunk);
      });
      response.on('end', () => {
        resolveOnce({
          body: Buffer.concat(chunks).toString('utf8'),
          headers: normalizeHeaders(response.headers),
          status: response.statusCode ?? 0,
          statusText: response.statusMessage ?? '',
        });
      });
    });

    const timeout = setTimeout(() => {
      requestMessage.destroy(new RequestTimeoutError());
    }, REQUEST_TIMEOUT_MS);

    requestMessage.on('error', rejectOnce);
    requestMessage.on('close', () => {
      clearTimeout(timeout);
    });

    if (body) {
      requestMessage.write(body);
    }

    requestMessage.end();
  });
}
