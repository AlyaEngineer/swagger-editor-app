import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FieldError, FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { ControlledTextField } from './controlled-text-field';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Используется, если ControlledTextField импортирует иконки так:
// import { Visibility, VisibilityOff } from '@mui/icons-material';
vi.mock('@mui/icons-material', () => ({
  Visibility: () => <span data-testid="visibility-icon" />,
  VisibilityOff: () => <span data-testid="visibility-off-icon" />,
}));

// Используются, если иконки импортируются напрямую:
// import Visibility from '@mui/icons-material/Visibility';
vi.mock('@mui/icons-material/Visibility', () => ({
  default: () => <span data-testid="visibility-icon" />,
}));

vi.mock('@mui/icons-material/VisibilityOff', () => ({
  default: () => <span data-testid="visibility-off-icon" />,
}));

type TestFormProps = {
  error?: FieldError;
  type?: string;
};

function TestForm({ error, type }: TestFormProps) {
  const methods = useForm({
    defaultValues: {
      field: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <ControlledTextField
        error={error}
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
    render(
      <TestForm
        error={{
          message: 'invalidEmail',
          type: 'invalid',
        }}
      />,
    );

    expect(screen.getByText('invalidEmail')).toBeInTheDocument();
  });

  it('does not show a password toggle button for non-password fields', () => {
    render(<TestForm type="email" />);

    expect(
      screen.queryByRole('button', {
        name: 'toggle password visibility',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders a password input initially', () => {
    render(<TestForm type="password" />);

    expect(screen.getByPlaceholderText('test placeholder')).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when the button is clicked', async () => {
    const user = userEvent.setup();

    render(<TestForm type="password" />);

    const input = screen.getByPlaceholderText('test placeholder');

    const toggleButton = screen.getByRole('button', {
      name: 'toggle password visibility',
    });

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');

    await user.click(toggleButton);

    expect(input).toHaveAttribute('type', 'password');
  });
});
