import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SwaggerViewer } from './swagger-view';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('SwaggerViewer', () => {
  it('shows the empty prompt when the schema is invalid', () => {
    render(<SwaggerViewer endpoints={[]} isValid={false} />);

    expect(screen.getByText('emptyPrompt')).toBeInTheDocument();
  });

  it('shows the no-endpoints warning when the schema is valid but empty', () => {
    render(<SwaggerViewer endpoints={[]} isValid />);

    expect(screen.getByText('noEndpoints')).toBeInTheDocument();
  });

  it('renders the endpoint list when endpoints are present', () => {
    render(
      <SwaggerViewer
        endpoints={[{ method: 'GET', path: '/users', summary: 'Get users' }]}
        isValid
      />,
    );

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('/users')).toBeInTheDocument();
    expect(screen.getByText('Get users')).toBeInTheDocument();
  });
});
