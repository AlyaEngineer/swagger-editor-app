import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSwagger } from './use-swagger';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function mockFetchOnce(response: { json: unknown; ok: boolean }) {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(response.json),
    ok: response.ok,
  }) as unknown as typeof fetch;
}

describe('useSwagger', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetchOnce({ json: {}, ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes with the default schema and validates it after debounce', async () => {
    const { result } = renderHook(() => useSwagger());

    expect(result.current.isValid).toBe(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isValid).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
  });

  it('restores the schema from the server when content is present', async () => {
    mockFetchOnce({
      json: { schema: { content: 'openapi: 3.0.0\ninfo:\n  title: Restored', format: 'yaml' } },
      ok: true,
    });

    const { result } = renderHook(() => useSwagger());

    await waitFor(() => {
      expect(result.current.editorValue).toContain('Restored');
    });
  });

  it('keeps the default schema when the restore response has no content or fails', async () => {
    mockFetchOnce({ json: {}, ok: false });

    const { result } = renderHook(() => useSwagger());
    const initialValue = result.current.editorValue;

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/schema');
    });

    expect(result.current.editorValue).toBe(initialValue);
  });

  it('toggles format without losing data, and sets an error on invalid schema', async () => {
    const { result } = renderHook(() => useSwagger());

    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });

    act(() => {
      result.current.handleFormatToggle();
    });

    expect(result.current.format).toBe('json');
    expect(() => JSON.parse(result.current.editorValue)).not.toThrow();

    act(() => {
      result.current.handleEditorChange('not a valid schema {{{');
    });

    act(() => {
      result.current.handleFormatToggle();
    });

    expect(result.current.error).not.toBeNull();
  });
});
