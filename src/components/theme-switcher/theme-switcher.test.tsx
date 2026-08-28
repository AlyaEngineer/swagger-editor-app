import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeSwitcher } from './theme-switcher';

const mocks = vi.hoisted(() => ({
  setMode: vi.fn(),
  useColorScheme: vi.fn(),
}));

vi.mock('@mui/material/styles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material/styles')>();

  return {
    ...actual,
    useColorScheme: mocks.useColorScheme,
  };
});

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

type ColorSchemeMock = {
  mode: Mode;
  systemMode: ThemeMode | undefined;
};
type Mode = 'system' | ThemeMode | undefined;

type RenderCase = ColorSchemeMock & {
  expectedChecked: boolean;
  expectedLabel: string;
};

type ThemeMode = 'dark' | 'light';

type ToggleCase = ColorSchemeMock & {
  expectedMode: ThemeMode;
};

const renderCases: RenderCase[] = [
  {
    expectedChecked: false,
    expectedLabel: 'switchToDarkTheme',
    mode: 'light',
    systemMode: undefined,
  },
  {
    expectedChecked: true,
    expectedLabel: 'switchToLightTheme',
    mode: 'dark',
    systemMode: undefined,
  },
  {
    expectedChecked: false,
    expectedLabel: 'switchToDarkTheme',
    mode: 'system',
    systemMode: 'light',
  },
  {
    expectedChecked: true,
    expectedLabel: 'switchToLightTheme',
    mode: 'system',
    systemMode: 'dark',
  },
];

const toggleCases: ToggleCase[] = [
  {
    expectedMode: 'dark',
    mode: 'light',
    systemMode: undefined,
  },
  {
    expectedMode: 'light',
    mode: 'dark',
    systemMode: undefined,
  },
  {
    expectedMode: 'dark',
    mode: 'system',
    systemMode: 'light',
  },
  {
    expectedMode: 'light',
    mode: 'system',
    systemMode: 'dark',
  },
];

function mockColorScheme({ mode, systemMode }: ColorSchemeMock) {
  mocks.useColorScheme.mockReturnValue({
    mode,
    setMode: mocks.setMode,
    systemMode,
  });
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    mocks.setMode.mockReset();
    mocks.useColorScheme.mockReset();
  });

  it('does not expose the switch before the mode is initialized', () => {
    mockColorScheme({
      mode: undefined,
      systemMode: undefined,
    });

    render(<ThemeSwitcher />);

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it.each(renderCases)(
    'renders mode "$mode" with system mode "$systemMode"',
    ({ expectedChecked, expectedLabel, mode, systemMode }) => {
      mockColorScheme({ mode, systemMode });

      render(<ThemeSwitcher />);

      const themeSwitch = screen.getByRole('switch', {
        name: expectedLabel,
      });

      expect(themeSwitch).toHaveAttribute('aria-checked', String(expectedChecked));
      expect(mocks.setMode).not.toHaveBeenCalled();
    },
  );

  it.each(toggleCases)(
    'sets "$expectedMode" for mode "$mode" with system mode "$systemMode"',
    async ({ expectedMode, mode, systemMode }) => {
      const user = userEvent.setup();

      mockColorScheme({ mode, systemMode });

      render(<ThemeSwitcher />);

      await user.click(screen.getByRole('switch'));

      expect(mocks.setMode).toHaveBeenCalledExactlyOnceWith(expectedMode);
    },
  );
});
