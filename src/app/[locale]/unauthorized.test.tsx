import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRouter } from '@/i18n/navigation';

import Unauthorized from './unauthorized';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('Unauthorized', () => {
  it('redirects to the main page on mount', () => {
    const replaceMock = vi.fn();

    vi.mocked(useRouter).mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: replaceMock,
    });

    render(<Unauthorized />);

    expect(replaceMock).toHaveBeenCalledWith('/');
  });
});
