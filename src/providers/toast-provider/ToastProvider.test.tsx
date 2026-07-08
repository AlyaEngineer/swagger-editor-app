import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ToastProvider, useToast } from './ToastProvider';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows toast with message when showToast is called', async () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current('Hello toast', 'success');
    });

    await waitFor(() => {
      expect(screen.getByText('Hello toast')).toBeInTheDocument();
    });
  });

  it('defaults to success severity when not specified', async () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current('Default severity');
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Default severity');
    });
  });

  it('applies error severity when specified', async () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current('Error occurred', 'error');
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Error occurred');
    });
  });

  it('closes toast when close button is clicked', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current('Closable toast', 'success');
    });

    await waitFor(() => {
      expect(screen.getByText('Closable toast')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByText('Closable toast')).not.toBeInTheDocument();
    });
  });

  it('throws error when useToast is used outside ToastProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useToast();
      } catch (error) {
        return error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toBe('useToast must be used within ToastProvider');
  });
});
