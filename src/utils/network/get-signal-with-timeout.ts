export function getSignalWithTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  function cleanup() {
    clearTimeout(timeoutId);
  }

  return { cleanup, signal: controller.signal };
}
