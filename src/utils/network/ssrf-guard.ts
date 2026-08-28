import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

import { BlockedUrlError } from './errors';
import { withTimeout } from './with-timeout';

const LOOKUP_TIMEOUT_MS = 8_000;

export type ResolvedAddress = {
  address: string;
  family: 4 | 6;
};

export function getHostname(url: URL) {
  return url.hostname.replace(/^\[/, '').replace(/\]$/, '');
}

export function isPublicIp(address: string): boolean {
  const ipVersion = isIP(address);

  if (ipVersion === 4) {
    return !isPrivateIpv4(address.split('.').map(Number));
  }

  if (ipVersion === 6) {
    const normalizedAddress = address.toLowerCase();

    if (normalizedAddress.startsWith('::ffff:')) {
      return isPublicIp(normalizedAddress.replace('::ffff:', ''));
    }

    return !(
      normalizedAddress === '::' ||
      normalizedAddress === '::1' ||
      normalizedAddress.startsWith('2001:db8:') ||
      normalizedAddress.startsWith('fc') ||
      normalizedAddress.startsWith('fd') ||
      /^fe[89ab][0-9a-f]:/.test(normalizedAddress) ||
      normalizedAddress.startsWith('ff')
    );
  }

  return false;
}

export async function resolvePublicAddress(url: URL): Promise<ResolvedAddress> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError();
  }

  const hostname = getHostname(url);
  const ipVersion = isIP(hostname);
  const addresses =
    ipVersion === 0
      ? await lookupWithTimeout(hostname)
      : [{ address: hostname, family: ipVersion }];

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new BlockedUrlError();
  }

  return addresses[0] as ResolvedAddress;
}

function isPrivateIpv4(parts: number[]) {
  const [first = 0, second = 0] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    first >= 224
  );
}

async function lookupWithTimeout(hostname: string) {
  return withTimeout(lookup(hostname, { all: true, verbatim: true }), LOOKUP_TIMEOUT_MS);
}
