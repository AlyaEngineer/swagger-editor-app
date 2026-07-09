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
            description: 'Delete all users.',
            method: 'DELETE',
            operationId: 'deleteUsers',
            parameters: [],
            path: '/users',
            requestBody: null,
            responses: [],
            summary: 'Delete users',
          },
          {
            description: 'Returns all users.',
            method: 'GET',
            operationId: 'listUsers',
            parameters: [
              {
                description: 'Page number.',
                in: 'query',
                name: 'page',
                required: false,
                schema: 'integer',
              },
            ],
            path: '/users',
            requestBody: null,
            responses: [
              {
                contentTypes: ['application/json'],
                description: 'Users response.',
                examples: ['{"users":[]}'],
                schema: 'object { users }',
                statusCode: '200',
              },
            ],
            summary: 'Get users',
          },
          {
            description: '',
            method: 'POST',
            operationId: '',
            parameters: [],
            path: '/users',
            requestBody: {
              contentTypes: ['application/json'],
              description: 'User payload.',
              examples: ['{"name":"Ada"}'],
              required: true,
              schema: 'object { name }',
            },
            responses: [],
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
    expect(screen.getAllByText('parametersTitle')).not.toHaveLength(0);
    expect(screen.getByText('page')).toBeInTheDocument();
    expect(screen.getByText('Page number.')).toBeInTheDocument();
    expect(screen.getAllByText('requestBodyTitle')).not.toHaveLength(0);
    expect(screen.getByText('User payload.')).toBeInTheDocument();
    expect(screen.getAllByText('responsesTitle')).not.toHaveLength(0);
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Users response.')).toBeInTheDocument();
    expect(screen.getByText('{"users":[]}')).toBeInTheDocument();

    const endpointArticle = screen.getByRole('article');
    const methods = within(endpointArticle).getAllByText(/DELETE|GET|POST/);

    expect(methods.map((method) => method.textContent)).toEqual(['GET', 'POST', 'DELETE']);
  });
});
