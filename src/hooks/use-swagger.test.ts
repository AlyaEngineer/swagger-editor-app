import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSwagger } from './use-swagger';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('useSwagger', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
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

  it('initializes with a restored server schema when one is provided', async () => {
    const { result } = renderHook(() =>
      useSwagger({
        content: 'openapi: 3.0.0\ninfo:\n  title: Restored',
        format: 'yaml',
      }),
    );

    expect(result.current.editorValue).toContain('Restored');
    expect(result.current.format).toBe('yaml');
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
