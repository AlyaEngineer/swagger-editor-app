import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from './error';

const messages = {
  errorPage: {
    description: 'Try refreshing the page or come back later',
    retry: 'Try again',
    title: 'Something went wrong',
  },
};

function renderErrorPage(error: Error, unstable_retry = vi.fn()) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ErrorPage error={error} unstable_retry={unstable_retry} />
    </NextIntlClientProvider>,
  );
}

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders title, description and retry button', () => {
    renderErrorPage(new Error('test error'));

    expect(screen.getByText(messages.errorPage.title)).toBeInTheDocument();
    expect(screen.getByText(messages.errorPage.description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.errorPage.retry })).toBeInTheDocument();
  });

  it('calls unstable_retry when retry button is clicked', async () => {
    const unstable_retry = vi.fn();
    const user = userEvent.setup();

    renderErrorPage(new Error('test error'), unstable_retry);

    await user.click(screen.getByRole('button', { name: messages.errorPage.retry }));

    expect(unstable_retry).toHaveBeenCalledTimes(1);
  });

  it('logs error to console on mount', () => {
    const error = new Error('test error');

    renderErrorPage(error);

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
