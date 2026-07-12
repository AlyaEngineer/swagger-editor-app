import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/client';
import { useToast } from '@/providers/toast-provider/ToastProvider';

import SignInForm from './sign-in-form';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const pushMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/lib/client', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/providers/toast-provider/ToastProvider', () => ({
  useToast: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  pushMock.mockClear();
});

describe('SignInForm', () => {
  it('shows validation errors and does not submit when fields are empty', async () => {
    const signInWithPassword = vi.fn();
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithPassword },
    } as unknown as ReturnType<typeof createClient>);
    vi.mocked(useToast).mockReturnValue(vi.fn());

    render(<SignInForm />);

    await userEvent.click(screen.getByRole('button', { name: 'signInButton' }));

    expect(await screen.findByText('emailRequired')).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('shows an error for a malformed email', async () => {
    const signInWithPassword = vi.fn();
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithPassword },
    } as unknown as ReturnType<typeof createClient>);
    vi.mocked(useToast).mockReturnValue(vi.fn());

    render(<SignInForm />);

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: 'signInButton' }));

    expect(await screen.findByText('invalidEmail')).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('signs in and redirects to home on success', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithPassword },
    } as unknown as ReturnType<typeof createClient>);
    vi.mocked(useToast).mockReturnValue(vi.fn());

    render(<SignInForm />);

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••'), 'anything');
    await userEvent.click(screen.getByRole('button', { name: 'signInButton' }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'anything',
      });
    });

    expect(pushMock).toHaveBeenCalled();
  });

  it('shows a toast when sign in fails', async () => {
    const showToastMock = vi.fn();
    const signInWithPassword = vi.fn().mockResolvedValue({ error: new Error('invalid') });
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithPassword },
    } as unknown as ReturnType<typeof createClient>);
    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignInForm />);

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••'), 'anything');
    await userEvent.click(screen.getByRole('button', { name: 'signInButton' }));

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('signInError', 'error');
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
