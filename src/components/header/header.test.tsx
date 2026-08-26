import type { ToolbarProps } from '@mui/material';
import type { ReactNode } from 'react';

import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BRAND_NAME } from '@/constants/brand';
import { ROUTES } from '@/constants/routes';

import { Header } from './header';

const mocks = vi.hoisted(() => ({
  toolbarProps: vi.fn(),
  useScrollTrigger: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>();

  return {
    ...actual,

    Toolbar: ({ children, ...props }: ToolbarProps) => {
      mocks.toolbarProps(props);

      return <div>{children}</div>;
    },

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

  AuthNavigation: () => <span>Auth navigation</span>,
  LanguageSwitcher: () => <span>Language switcher</span>,
  ThemeSwitcher: () => <span>Theme switcher</span>,
}));

describe('Header', () => {
  beforeEach(() => {
    mocks.toolbarProps.mockClear();
    mocks.useScrollTrigger.mockReset();
    mocks.useTranslations.mockReset();

    mocks.useScrollTrigger.mockReturnValue(false);

    mocks.useTranslations.mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        about: 'About',
      };

      return translations[key] ?? key;
    });
  });

  it('renders the brand link', () => {
    render(<Header />);

    expect(
      screen.getByRole('link', {
        name: BRAND_NAME,
      }),
    ).toHaveAttribute('href', ROUTES.home);
  });

  it('renders the main navigation', () => {
    render(<Header />);

    const navigation = screen.getByRole('navigation', {
      name: 'navigationLabel',
    });

    const navigationQueries = within(navigation);

    expect(
      navigationQueries.getByRole('link', {
        name: 'About',
      }),
    ).toHaveAttribute('href', ROUTES.about);

    expect(navigationQueries.getByText('Auth navigation')).toBeInTheDocument();

    expect(navigationQueries.getByText('Theme switcher')).toBeInTheDocument();

    expect(navigationQueries.getByText('Language switcher')).toBeInTheDocument();
  });

  it('uses the Header translation namespace', () => {
    render(<Header />);

    expect(mocks.useTranslations).toHaveBeenCalledWith('Header');
  });

  it('configures the sticky scroll trigger', () => {
    render(<Header />);

    expect(mocks.useScrollTrigger).toHaveBeenCalledWith({
      disableHysteresis: true,
      threshold: 32,
    });
  });

  it('renders the expanded header before the scroll threshold', () => {
    mocks.useScrollTrigger.mockReturnValue(false);

    render(<Header />);

    expect(mocks.toolbarProps).toHaveBeenCalledWith(
      expect.objectContaining({
        style: {
          minHeight: 64,
          transition: 'min-height 200ms',
        },
        sx: expect.objectContaining({
          py: 1.25,
        }),
      }),
    );
  });

  it('renders the compact header after the scroll threshold', () => {
    mocks.useScrollTrigger.mockReturnValue(true);

    render(<Header />);

    expect(mocks.toolbarProps).toHaveBeenCalledWith(
      expect.objectContaining({
        style: {
          minHeight: 52,
          transition: 'min-height 200ms',
        },
        sx: expect.objectContaining({
          py: 0.5,
        }),
      }),
    );
  });
});
