import type { ReactNode } from 'react';

import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RootLayout, { generateMetadata } from './layout';

const mocks = vi.hoisted(() => ({
  getTranslations: vi.fn(),
}));

vi.mock('../globals.css', () => ({}));

vi.mock('next-intl/server', () => ({
  getTranslations: mocks.getTranslations,
}));

vi.mock('@components', () => ({
  Footer: () => <footer>Footer</footer>,
  Header: () => <header>Header</header>,
}));

vi.mock('@mui/material', () => ({
  Box: ({
    children,
    component: Component = 'div',
  }: {
    children: ReactNode;
    component?: React.ElementType;
  }) => <Component>{children}</Component>,
}));

vi.mock('@mui/material/InitColorSchemeScript', () => ({
  default: ({ defaultMode }: { defaultMode: string }) => (
    <div data-default-mode={defaultMode} data-testid="color-scheme-script" />
  ),
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="intl-provider">{children}</div>
  ),
}));

vi.mock('@/providers/auth-provider/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('@/providers/mui-provider', () => ({
  MuiProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="mui-provider">{children}</div>
  ),
}));

vi.mock('@/fonts', () => ({
  appFont: {
    variable: 'app-font-variable',
  },
  swaggerEditorFont: {
    variable: 'swagger-editor-font-variable',
  },
}));

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getTranslations.mockResolvedValue((key: string) => {
      const translations: Record<string, string> = {
        description: 'Swagger editor description',
        title: 'Swagger Editor',
      };

      return translations[key] ?? key;
    });
  });

  it('returns translated metadata for the requested locale', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: 'en',
      }),
    });

    expect(mocks.getTranslations).toHaveBeenCalledWith({
      locale: 'en',
      namespace: 'Metadata',
    });

    expect(metadata).toEqual({
      description: 'Swagger editor description',
      title: 'Swagger Editor',
    });
  });

  it('passes another locale to getTranslations', async () => {
    await generateMetadata({
      params: Promise.resolve({
        locale: 'ru',
      }),
    });

    expect(mocks.getTranslations).toHaveBeenCalledWith({
      locale: 'ru',
      namespace: 'Metadata',
    });
  });
});

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an html element with locale and font classes', async () => {
    const layout = await RootLayout({
      children: <div>Page content</div>,
      params: Promise.resolve({
        locale: 'ru',
      }),
    });

    expect(layout).toMatchObject({
      props: {
        className: 'app-font-variable swagger-editor-font-variable',
        lang: 'ru',
        suppressHydrationWarning: true,
      },
      type: 'html',
    });
  });

  it('renders the application layout', async () => {
    const layout = await RootLayout({
      children: <div>Page content</div>,
      params: Promise.resolve({
        locale: 'en',
      }),
    });

    render(layout);

    expect(screen.getByTestId('color-scheme-script')).toHaveAttribute(
      'data-default-mode',
      'system',
    );

    expect(screen.getByTestId('intl-provider')).toBeInTheDocument();

    expect(screen.getByTestId('mui-provider')).toBeInTheDocument();

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();

    expect(screen.getByRole('banner')).toHaveTextContent('Header');

    expect(screen.getByRole('main')).toBeInTheDocument();

    expect(screen.getByText('Page content')).toBeInTheDocument();

    expect(screen.getByRole('contentinfo')).toHaveTextContent('Footer');
  });

  it('renders children inside the main element', async () => {
    const layout = await RootLayout({
      children: (
        <section>
          <h1>Test page</h1>
          <p>Test page content</p>
        </section>
      ),
      params: Promise.resolve({
        locale: 'en',
      }),
    });

    render(layout);

    const main = screen.getByRole('main');

    expect(
      within(main).getByRole('heading', {
        name: 'Test page',
      }),
    ).toBeInTheDocument();

    expect(within(main).getByText('Test page content')).toBeInTheDocument();
  });
});
