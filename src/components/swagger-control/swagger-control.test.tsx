import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SwaggerControl } from './swagger-control';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const baseProps = {
  editorValue: 'openapi: 3.0.0',
  format: 'yaml' as const,
  handleFormatToggle: vi.fn(),
  setError: vi.fn(),
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SwaggerControl', () => {
  it('enables the toggle and save button when the schema is valid', () => {
    render(<SwaggerControl {...baseProps} isValid />);

    expect(screen.getByRole('switch')).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'saveButton' })).not.toBeDisabled();
  });

  it('disables the toggle and shows a tooltip hint when the schema is invalid', () => {
    render(<SwaggerControl {...baseProps} isValid={false} />);

    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'saveButton' })).toBeDisabled();
  });

  it('calls handleFormatToggle when the switch is clicked', async () => {
    render(<SwaggerControl {...baseProps} isValid />);

    await userEvent.click(screen.getByRole('switch'));

    expect(baseProps.handleFormatToggle).toHaveBeenCalledTimes(1);
  });

  it('calls the save endpoint and shows "saving" state on click', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    ) as unknown as typeof fetch;

    render(<SwaggerControl {...baseProps} isValid />);

    await userEvent.click(screen.getByRole('button', { name: 'saveButton' }));

    expect(await screen.findByRole('button', { name: 'saving' })).toBeInTheDocument();
    resolveFetch({ ok: true });
    expect(await screen.findByRole('button', { name: 'saveButton' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/schema', expect.objectContaining({ method: 'POST' }));
  });

  it('sets an error when the save request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    const setError = vi.fn();

    render(<SwaggerControl {...baseProps} isValid setError={setError} />);

    await userEvent.click(screen.getByRole('button', { name: 'saveButton' }));

    await screen.findByRole('button', { name: 'saveButton' });

    expect(setError).toHaveBeenCalledWith('Failed to save schema');
  });
});
