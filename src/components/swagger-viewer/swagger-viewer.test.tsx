import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SwaggerViewer } from './swagger-viewer';

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

  it('renders schema metadata and endpoints grouped by path with sorted methods', () => {
    render(
      <SwaggerViewer
        apiInfo={{
          description: 'Swagger Petstore description.',
          title: 'Swagger Petstore',
          version: '1.0.0',
        }}
        endpoints={[
          {
            method: 'DELETE',
            path: '/users',
            summary: 'Delete users',
          },
          {
            method: 'GET',
            path: '/users',
            summary: 'Get users',
          },
          {
            method: 'POST',
            path: '/users',
            summary: '',
          },
        ]}
        isValid
      />,
    );

    expect(screen.getByRole('region', { name: 'endpointListLabel' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Swagger Petstore' })).toBeInTheDocument();
    expect(screen.getByText('Swagger Petstore description.')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('/users')).toBeInTheDocument();
    expect(screen.getByText('Get users')).toBeInTheDocument();
    expect(screen.getByText('noSummary')).toBeInTheDocument();

    const endpointArticle = screen.getByRole('article');
    const methods = within(endpointArticle).getAllByText(/DELETE|GET|POST/);

    expect(methods.map((method) => method.textContent)).toEqual(['GET', 'POST', 'DELETE']);
  });
});
