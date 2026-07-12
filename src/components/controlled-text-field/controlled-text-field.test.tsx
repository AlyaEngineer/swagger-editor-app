import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { ControlledTextField } from './controlled-text-field';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function TestForm({ error, type }: { error?: { message: string; type: string }; type?: string }) {
  const methods = useForm({ defaultValues: { field: '' } });

  return (
    <FormProvider {...methods}>
      <ControlledTextField
        error={error as never}
        labelKey="testLabel"
        name="field"
        placeholder="test placeholder"
        type={type}
      />
    </FormProvider>
  );
}

describe('ControlledTextField', () => {
  it('renders the label and placeholder', () => {
    render(<TestForm />);

    expect(screen.getByText('testLabel')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('test placeholder')).toBeInTheDocument();
  });

  it('shows the translated error message when an error is provided', () => {
    render(<TestForm error={{ message: 'invalidEmail', type: 'invalid' }} />);

    expect(screen.getByText('invalidEmail')).toBeInTheDocument();
  });

  it('does not show a password toggle button for non-password fields', () => {
    render(<TestForm type="email" />);

    expect(screen.queryByLabelText('toggle password visibility')).not.toBeInTheDocument();
  });

  it('toggles password visibility when the icon button is clicked', async () => {
    render(<TestForm type="password" />);

    const input = screen.getByPlaceholderText('test placeholder');
    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByLabelText('toggle password visibility'));

    expect(input).toHaveAttribute('type', 'text');
  });
});
