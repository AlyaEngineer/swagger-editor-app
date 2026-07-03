import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Toast } from './Toast';

describe('Toast', () => {
  it('renders message when open', () => {
    render(<Toast message="Test message" onClose={vi.fn()} open severity="success" />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render message when closed', () => {
    render(<Toast message="Test message" onClose={vi.fn()} open={false} severity="success" />);

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('renders error message with alert role', () => {
    render(<Toast message="Error message" onClose={vi.fn()} open severity="error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Error message');
  });

  it('renders success message with alert role', () => {
    render(<Toast message="Success message" onClose={vi.fn()} open severity="success" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Success message');
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<Toast message="Test message" onClose={onClose} open severity="success" />);

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
