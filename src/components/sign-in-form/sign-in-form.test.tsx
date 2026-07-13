import type { ReactNode } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/client';
import { useToast } from '@/providers/toast-provider/ToastProvider';

import SignInForm from './sign-in-form';

const pushMock = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),

  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@/lib/client', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/providers/toast-provider/ToastProvider', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/components/app-link/app-link', () => ({
  AppLinkButton: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/auth-card/auth-card', () => ({
  AuthCard: ({
    children,
    footer,
    title,
  }: {
    children: ReactNode;
    footer?: ReactNode;
    title: ReactNode;
  }) => (
    <section>
      <h1>{title}</h1>
      {children}
      {footer}
    </section>
  ),
}));

vi.mock('@/components/controlled-text-field/controlled-text-field', () => ({
  ControlledTextField: ({
    autoComplete,
    name,
    placeholder,
    type,
  }: {
    autoComplete?: string;
    name: string;
    placeholder?: string;
    type?: string;
  }) => {
    const {
      formState: { errors },
      register,
    } = useFormContext();

    const error = errors[name];

    return (
      <div>
        <input
          {...register(name)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          type={type}
        />

        {typeof error?.message === 'string' && <span>{error.message}</span>}
      </div>
    );
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('SignInForm', () => {
  it('shows validation errors and does not submit when fields are empty', async () => {
    const user = userEvent.setup();
    const signInWithPassword = vi.fn();

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signInWithPassword,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(vi.fn());

    render(<SignInForm />);

    await user.click(
      screen.getByRole('button', {
        name: 'signInButton',
      }),
    );

    expect(await screen.findByText('emailRequired')).toBeInTheDocument();

    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('shows an error for a malformed email', async () => {
    const user = userEvent.setup();
    const signInWithPassword = vi.fn();

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signInWithPassword,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(vi.fn());

    render(<SignInForm />);

    await user.type(screen.getByPlaceholderText('your@email.com'), 'not-an-email');

    await user.click(
      screen.getByRole('button', {
        name: 'signInButton',
      }),
    );

    expect(await screen.findByText('invalidEmail')).toBeInTheDocument();

    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('signs in and redirects to home on success', async () => {
    const user = userEvent.setup();

    const signInWithPassword = vi.fn().mockResolvedValue({
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signInWithPassword,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(vi.fn());

    render(<SignInForm />);

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');

    await user.type(screen.getByPlaceholderText('••••••'), 'anything');

    await user.click(
      screen.getByRole('button', {
        name: 'signInButton',
      }),
    );

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'anything',
      });
    });

    expect(pushMock).toHaveBeenCalled();
  });

  it('shows a toast when sign in fails', async () => {
    const user = userEvent.setup();
    const showToastMock = vi.fn();

    const signInWithPassword = vi.fn().mockResolvedValue({
      error: new Error('invalid'),
    });

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signInWithPassword,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignInForm />);

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');

    await user.type(screen.getByPlaceholderText('••••••'), 'anything');

    await user.click(
      screen.getByRole('button', {
        name: 'signInButton',
      }),
    );

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('signInError', 'error');
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows a toast when sign in throws an exception', async () => {
    const user = userEvent.setup();
    const showToastMock = vi.fn();

    const signInWithPassword = vi.fn().mockRejectedValue(new Error('network error'));

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signInWithPassword,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignInForm />);

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');

    await user.type(screen.getByPlaceholderText('••••••'), 'anything');

    await user.click(
      screen.getByRole('button', {
        name: 'signInButton',
      }),
    );

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('signInError', 'error');
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
