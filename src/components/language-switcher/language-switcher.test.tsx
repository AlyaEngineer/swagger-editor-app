import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageSwitcher } from './language-switcher';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  useLocale: vi.fn(),
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useLocale: mocks.useLocale,
  useTranslations: mocks.useTranslations,
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: mocks.usePathname,
  useRouter: mocks.useRouter,
}));

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'ru'],
  },
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mocks.replace.mockReset();

    mocks.useLocale.mockReturnValue('en');
    mocks.usePathname.mockReturnValue('/about');
    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
    });

    mocks.useTranslations.mockReturnValue((key: string) => {
      if (key === 'language') {
        return 'Language';
      }

      return key;
    });
  });

  it('renders the current locale', () => {
    render(<LanguageSwitcher />);

    const select = screen.getByRole('combobox', {
      name: 'Language',
    });

    expect(select).toBeInTheDocument();
    expect(select).toHaveTextContent('EN');
    expect(mocks.useTranslations).toHaveBeenCalledWith('Header');
  });

  it('renders all available locales', async () => {
    const user = userEvent.setup();

    render(<LanguageSwitcher />);

    await user.click(
      screen.getByRole('combobox', {
        name: 'Language',
      }),
    );

    expect(screen.getByRole('option', { name: 'EN' })).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'RU' })).toBeInTheDocument();
  });

  it('replaces the current route with the selected locale', async () => {
    const user = userEvent.setup();

    render(<LanguageSwitcher />);

    await user.click(
      screen.getByRole('combobox', {
        name: 'Language',
      }),
    );

    await user.click(
      screen.getByRole('option', {
        name: 'RU',
      }),
    );

    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/about', {
      locale: 'ru',
    });
  });

  it('shows another locale when it is currently active', () => {
    mocks.useLocale.mockReturnValue('ru');

    render(<LanguageSwitcher />);

    expect(
      screen.getByRole('combobox', {
        name: 'Language',
      }),
    ).toHaveTextContent('RU');
  });
});
