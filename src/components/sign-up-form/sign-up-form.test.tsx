import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/client';
import { useToast } from '@/providers/toast-provider/ToastProvider';

import SignUpForm from './sign-up-form';

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

describe('SignUpForm', () => {
  it('signs up with name metadata and redirects on success', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue({
      auth: { signUp },
    } as unknown as ReturnType<typeof createClient>);
    const showToastMock = vi.fn();
    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText('namePlaceholder'), 'Jon Snow');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••'), 'Qwerty1!');

    await userEvent.click(screen.getByRole('button', { name: 'signUpButton' }));

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

  it('shows a toast when sign up fails', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: new Error('email taken') });
    vi.mocked(createClient).mockReturnValue({
      auth: { signUp },
    } as unknown as ReturnType<typeof createClient>);
    const showToastMock = vi.fn();
    vi.mocked(useToast).mockReturnValue(showToastMock);

    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText('namePlaceholder'), 'Jon Snow');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'user@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••'), 'Qwerty1!');
    await userEvent.click(screen.getByRole('button', { name: 'signUpButton' }));

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith('signUpError', 'error');
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
