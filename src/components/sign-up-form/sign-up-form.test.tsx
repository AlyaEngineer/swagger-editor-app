import type { ReactNode } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/client';
import { useToast } from '@/providers/toast-provider/ToastProvider';

import SignUpForm from './sign-up-form';

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

vi.mock('@/components/controlled-text-field/controlled-text-field', async () => {
  const { useFormContext } = await import('react-hook-form');

  return {
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
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SignUpForm', () => {
  it('signs up with name metadata and redirects on success', async () => {
    const user = userEvent.setup();
    const showToastMock = vi.fn();

    const signUp = vi.fn().mockResolvedValue({
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signUp,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignUpForm />);

    await user.type(screen.getByPlaceholderText('namePlaceholder'), 'Jon Snow');

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');

    await user.type(screen.getByPlaceholderText('••••••'), 'Qwerty1!');

    await user.click(
      screen.getByRole('button', {
        name: 'signUpButton',
      }),
    );

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          password: 'Qwerty1!',
        }),
      );
    });

    expect(showToastMock).toHaveBeenCalledWith('signUpSuccess', 'success');

    expect(pushMock).toHaveBeenCalled();
  });

  it('passes the user name in sign-up metadata', async () => {
    const user = userEvent.setup();

    const signUp = vi.fn().mockResolvedValue({
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signUp,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(vi.fn());

    render(<SignUpForm />);

    await user.type(screen.getByPlaceholderText('namePlaceholder'), 'Jon Snow');

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');

    await user.type(screen.getByPlaceholderText('••••••'), 'Qwerty1!');

    await user.click(
      screen.getByRole('button', {
        name: 'signUpButton',
      }),
    );

    await waitFor(() => {
      expect(signUp).toHaveBeenCalled();
    });

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({
            full_name: 'Jon Snow',
          }),
        }),
      }),
    );
  });

  it('shows a toast when sign up fails', async () => {
    const user = userEvent.setup();
    const showToastMock = vi.fn();

    const signUp = vi.fn().mockResolvedValue({
      error: new Error('email taken'),
    });

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signUp,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignUpForm />);

    await user.type(screen.getByPlaceholderText('namePlaceholder'), 'Jon Snow');

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');

    await user.type(screen.getByPlaceholderText('••••••'), 'Qwerty1!');

    await user.click(
      screen.getByRole('button', {
        name: 'signUpButton',
      }),
    );

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('signUpError', 'error');
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows a toast when sign up throws an exception', async () => {
    const user = userEvent.setup();
    const showToastMock = vi.fn();

    const signUp = vi.fn().mockRejectedValue(new Error('network error'));

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signUp,
      },
    } as unknown as ReturnType<typeof createClient>);

    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignUpForm />);

    await user.type(screen.getByPlaceholderText('namePlaceholder'), 'Jon Snow');

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');

    await user.type(screen.getByPlaceholderText('••••••'), 'Qwerty1!');

    await user.click(
      screen.getByRole('button', {
        name: 'signUpButton',
      }),
    );

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('signUpError', 'error');
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
