import type { ReactNode } from 'react';

import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MuiProvider } from './mui-provider';

const mocks = vi.hoisted(() => ({
  theme: {
    name: 'test-theme',
  },
  themeProvider: vi.fn(),
}));

vi.mock('@mui/material-nextjs/v16-appRouter', () => ({
  AppRouterCacheProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-router-cache-provider">{children}</div>
  ),
}));

vi.mock('@mui/material/CssBaseline', () => ({
  default: () => <div data-testid="css-baseline" />,
}));

vi.mock('@mui/material/styles', () => ({
  ThemeProvider: ({
    children,
    defaultMode,
    theme,
  }: {
    children: ReactNode;
    defaultMode: string;
    theme: unknown;
  }) => {
    mocks.themeProvider({
      defaultMode,
      theme,
    });

    return (
      <div data-default-mode={defaultMode} data-testid="theme-provider">
        {children}
      </div>
    );
  },
}));

vi.mock('@/providers/toast-provider/ToastProvider', () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}));

vi.mock('@/theme/theme', () => ({
  theme: mocks.theme,
}));

describe('MuiProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children inside the toast provider', () => {
    render(
      <MuiProvider>
        <div>Page content</div>
      </MuiProvider>,
    );

    const toastProvider = screen.getByTestId('toast-provider');

    expect(within(toastProvider).getByText('Page content')).toBeInTheDocument();
  });

  it('renders all providers and CssBaseline', () => {
    render(
      <MuiProvider>
        <div>Page content</div>
      </MuiProvider>,
    );

    const cacheProvider = screen.getByTestId('app-router-cache-provider');

    const themeProvider = within(cacheProvider).getByTestId('theme-provider');

    expect(within(themeProvider).getByTestId('css-baseline')).toBeInTheDocument();

    expect(within(themeProvider).getByTestId('toast-provider')).toBeInTheDocument();
  });

  it('passes the application theme and system mode to ThemeProvider', () => {
    render(
      <MuiProvider>
        <div>Page content</div>
      </MuiProvider>,
    );

    expect(mocks.themeProvider).toHaveBeenCalledExactlyOnceWith({
      defaultMode: 'system',
      theme: mocks.theme,
    });

    expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-default-mode', 'system');
  });
});
