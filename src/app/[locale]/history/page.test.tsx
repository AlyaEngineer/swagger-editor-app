import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAuthenticatedUser } from '@/utils/auth/get-authenticated-user';
import { getRequestHistory } from '@/utils/history/get-request-history';

import HistoryPage from './page';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock('@/utils/auth/get-authenticated-user', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/utils/history/get-request-history', () => ({
  getRequestHistory: vi.fn(),
}));

vi.mock('@/components/history-empty-state/history-empty-state', () => ({
  HistoryEmptyState: () => <div data-testid="empty-state-stub" />,
}));

vi.mock('@/components/history-list/history-list', () => ({
  HistoryList: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="history-list-stub">{entries.length}</div>
  ),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HistoryPage', () => {
  it('calls getAuthenticatedUser to protect the route', async () => {
    vi.mocked(getRequestHistory).mockResolvedValue({ entries: [], hasError: false });

    const jsx = await HistoryPage();
    render(jsx);

    expect(getAuthenticatedUser).toHaveBeenCalled();
  });

  it('shows an error alert when the history fails to load', async () => {
    vi.mocked(getRequestHistory).mockResolvedValue({ entries: [], hasError: true });

    const jsx = await HistoryPage();
    render(jsx);

    expect(screen.getByText('historyLoadError')).toBeInTheDocument();
  });

  it('shows the empty state when there are no entries', async () => {
    vi.mocked(getRequestHistory).mockResolvedValue({ entries: [], hasError: false });

    const jsx = await HistoryPage();
    render(jsx);

    expect(screen.getByTestId('empty-state-stub')).toBeInTheDocument();
  });

  it('shows the history list when there are entries', async () => {
    vi.mocked(getRequestHistory).mockResolvedValue({
      entries: [{ id: '1' }] as never,
      hasError: false,
    });

    const jsx = await HistoryPage();
    render(jsx);

    expect(screen.getByTestId('history-list-stub')).toHaveTextContent('1');
  });
});
