import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MainText } from './main-text';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('MainText', () => {
  it('renders title and description from HomePage namespace', () => {
    render(<MainText />);

    expect(screen.getByRole('heading', { level: 1, name: 'title' })).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });
});
