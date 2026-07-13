import type { CSSProperties, ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BRAND_NAME } from '@/constants/brand';
import { ROUTES } from '@/constants/routes';

import { Header } from './header';

const mocks = vi.hoisted(() => ({
  useScrollTrigger: vi.fn(),
  useTranslations: vi.fn(() => (key: string) => (key === 'about' ? 'About' : key)),
}));

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>();

  return {
    ...actual,

    Toolbar: ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
      <div data-testid="header-toolbar" style={style}>
        {children}
      </div>
    ),

    useScrollTrigger: mocks.useScrollTrigger,
  };
});

vi.mock('next-intl', () => ({
  useTranslations: mocks.useTranslations,
}));

vi.mock('@/components', () => ({
  AppLinkButton: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),

  AuthNavigation: () => <div data-testid="auth-navigation">Auth navigation</div>,

  LanguageSwitcher: () => <div data-testid="language-switcher">Language switcher</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useScrollTrigger.mockReturnValue(false);
  });

  it('renders header navigation', () => {
    render(<Header />);

    expect(mocks.useTranslations).toHaveBeenCalledWith('Header');

    expect(
      screen.getByRole('link', {
        name: BRAND_NAME,
      }),
    ).toHaveAttribute('href', ROUTES.home);

    expect(
      screen.getByRole('link', {
        name: 'About',
      }),
    ).toHaveAttribute('href', ROUTES.about);

    expect(
      screen.getByRole('navigation', {
        name: 'Main navigation',
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId('auth-navigation')).toBeInTheDocument();

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('configures the scroll trigger', () => {
    render(<Header />);

    expect(mocks.useScrollTrigger).toHaveBeenCalledWith({
      disableHysteresis: true,
      threshold: 32,
    });
  });

  it('uses expanded size when page is not scrolled past the threshold', () => {
    mocks.useScrollTrigger.mockReturnValue(false);

    render(<Header />);

    expect(screen.getByTestId('header-toolbar')).toHaveStyle({
      minHeight: '64px',
      transition: 'min-height 200ms',
    });
  });

  it('uses compact size when page is scrolled past the threshold', () => {
    mocks.useScrollTrigger.mockReturnValue(true);

    render(<Header />);

    expect(screen.getByTestId('header-toolbar')).toHaveStyle({
      minHeight: '52px',
      transition: 'min-height 200ms',
    });
  });
});
