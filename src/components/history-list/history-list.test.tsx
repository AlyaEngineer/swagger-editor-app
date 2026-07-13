import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { RequestHistoryEntry } from '@/utils/history/get-request-history';

import { HistoryList } from './history-list';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function createEntry(overrides: Partial<RequestHistoryEntry>): RequestHistoryEntry {
  return {
    createdAt: '2026-07-12T09:46:10.444583+00',
    durationMs: 245,
    endpoint: 'https://api.example.com/users',
    errorDetails: null,
    id: '1',
    method: 'GET',
    requestSize: 0,
    responseSize: 1024,
    statusCode: 200,
    ...overrides,
  };
}

describe('HistoryList', () => {
  it('renders column headers', () => {
    render(<HistoryList entries={[createEntry({})]} />);

    expect(screen.getByText('methodColumn')).toBeInTheDocument();
    expect(screen.getByText('endpointColumn')).toBeInTheDocument();
    expect(screen.getByText('statusColumn')).toBeInTheDocument();
    expect(screen.getByText('durationColumn')).toBeInTheDocument();
    expect(screen.getByText('requestSizeColumn')).toBeInTheDocument();
    expect(screen.getByText('responseSizeColumn')).toBeInTheDocument();
    expect(screen.getByText('timestampColumn')).toBeInTheDocument();
    expect(screen.getByText('errorColumn')).toBeInTheDocument();
  });

  it('renders an entry with method, endpoint, status, duration, and sizes', () => {
    render(<HistoryList entries={[createEntry({})]} />);

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('245ms')).toBeInTheDocument();
    expect(screen.getByText('0B')).toBeInTheDocument();
    expect(screen.getByText('1024B')).toBeInTheDocument();
  });

  it('shows a dash when there are no error details', () => {
    render(<HistoryList entries={[createEntry({ errorDetails: null })]} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the error details text when present', () => {
    render(<HistoryList entries={[createEntry({ errorDetails: 'Not Found' })]} />);

    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('truncates long error details and shows the full text in a tooltip', async () => {
    const longError = 'A'.repeat(60);

    render(<HistoryList entries={[createEntry({ errorDetails: longError })]} />);

    const truncated = screen.getByText(`${'A'.repeat(40)}…`);
    expect(truncated).toBeInTheDocument();

    await userEvent.hover(truncated);

    expect(await screen.findByText(longError)).toBeInTheDocument();
  });

  it('paginates entries, showing only the first page by default', async () => {
    const entries = Array.from({ length: 15 }, (_, index) =>
      createEntry({ endpoint: `https://api.example.com/item-${index}`, id: String(index) }),
    );

    render(<HistoryList entries={entries} />);

    expect(screen.getByText('https://api.example.com/item-0')).toBeInTheDocument();
    expect(screen.queryByText('https://api.example.com/item-10')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /next page/i }));

    expect(screen.getByText('https://api.example.com/item-10')).toBeInTheDocument();
    expect(screen.queryByText('https://api.example.com/item-0')).not.toBeInTheDocument();
  });

  it('changes rows per page and resets to the first page', async () => {
    const entries = Array.from({ length: 15 }, (_, index) =>
      createEntry({ endpoint: `https://api.example.com/item-${index}`, id: String(index) }),
    );

    render(<HistoryList entries={entries} />);

    await userEvent.click(screen.getByRole('combobox', { name: /rows per page/i }));
    await userEvent.click(await screen.findByRole('option', { name: '25' }));

    expect(screen.getByText('https://api.example.com/item-10')).toBeInTheDocument();
  });
});
