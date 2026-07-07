import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GlobalError from './global-error';

describe('GlobalError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders title, description and retry button', () => {
    render(<GlobalError error={new Error('test error')} unstable_retry={vi.fn()} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try refreshing the page or come back later')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('calls unstable_retry when retry button is clicked', async () => {
    const unstable_retry = vi.fn();
    const user = userEvent.setup();

    render(<GlobalError error={new Error('test error')} unstable_retry={unstable_retry} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(unstable_retry).toHaveBeenCalledTimes(1);
  });

  it('logs error to console', () => {
    const error = new Error('test error');

    render(<GlobalError error={error} unstable_retry={vi.fn()} />);

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
