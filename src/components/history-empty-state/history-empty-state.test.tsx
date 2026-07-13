import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { HistoryEmptyState } from './history-empty-state';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('HistoryEmptyState', () => {
  it('renders the informational message, hint, and link to the editor', () => {
    render(<HistoryEmptyState />);

    expect(screen.getByText('emptyMessage')).toBeInTheDocument();
    expect(screen.getByText('emptyLinksHint')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'goToEditor' });
    expect(link).toHaveAttribute('href', '/');
  });
});
