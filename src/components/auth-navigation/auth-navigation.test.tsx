import type { ReactElement, ReactNode } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuth } from '@/providers/auth-provider/AuthProvider';
import { ToastProvider } from '@/providers/toast-provider/ToastProvider';

import { AuthNavigation } from './auth-navigation';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/providers/auth-provider/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderWithToast(ui: ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AuthNavigation', () => {
  it('renders nothing while auth state is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isAuthLoading: true,
      signOut: vi.fn(),
    });

    const { container } = renderWithToast(<AuthNavigation />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows History and Sign Out links when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAuthLoading: false,
      signOut: vi.fn(),
    });

    renderWithToast(<AuthNavigation />);

    expect(screen.getByRole('link', { name: 'history' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'signOut' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'signIn' })).not.toBeInTheDocument();
  });

  it('shows Sign In and Sign Up links when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isAuthLoading: false,
      signOut: vi.fn(),
    });

    renderWithToast(<AuthNavigation />);

    expect(screen.getByRole('link', { name: 'signIn' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'signUp' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'history' })).not.toBeInTheDocument();
  });

  it('calls signOut when the Sign Out button is clicked', async () => {
    const signOutMock = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAuthLoading: false,
      signOut: signOutMock,
    });

    renderWithToast(<AuthNavigation />);

    await userEvent.click(screen.getByRole('button', { name: 'signOut' }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('shows a toast when sign out fails', async () => {
    const signOutMock = vi.fn().mockRejectedValue(new Error('network error'));

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAuthLoading: false,
      signOut: signOutMock,
    });

    renderWithToast(<AuthNavigation />);

    await userEvent.click(screen.getByRole('button', { name: 'signOut' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('signOutError');
    });
  });
});
