import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/providers/toast-provider/ToastProvider';

import { SwaggerViewer } from './swagger-viewer';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function renderViewer(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('SwaggerViewer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the empty prompt when the schema is invalid', () => {
    renderViewer(<SwaggerViewer endpoints={[]} isValid={false} />);

    expect(screen.getByText('emptyPrompt')).toBeInTheDocument();
  });

  it('shows the no-endpoints warning when the schema is valid but empty', () => {
    renderViewer(<SwaggerViewer endpoints={[]} isValid />);

    expect(screen.getByText('noEndpoints')).toBeInTheDocument();
  });

  it('renders schema metadata and endpoints grouped by path with sorted methods', () => {
    renderViewer(
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
            serverUrl: 'https://api.example.com',
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
                description: 'Users response.',
                mediaTypes: [
                  {
                    contentType: 'application/json',
                    examples: ['{"users":[]}'],
                    generatedExample: '',
                    schema: 'object { users }',
                  },
                ],
                statusCode: '200',
              },
            ],
            serverUrl: 'https://api.example.com',
            summary: 'Get users',
          },
          {
            description: '',
            method: 'POST',
            operationId: '',
            parameters: [],
            path: '/users',
            requestBody: {
              description: 'User payload.',
              mediaTypes: [
                {
                  contentType: 'application/json',
                  examples: ['{"name":"Ada"}'],
                  generatedExample: '',
                  schema: 'object { name }',
                },
              ],
              required: true,
            },
            responses: [],
            serverUrl: 'https://api.example.com',
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

  it('executes an endpoint through the server route and displays the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          body: '{"ok":true}',
          durationMs: 42,
          headers: { 'content-type': 'application/json' },
          status: 200,
          statusText: 'OK',
        }),
      ok: true,
    });
    vi.stubGlobal('fetch', fetchMock);

    renderViewer(
      <SwaggerViewer
        endpoints={[
          {
            description: '',
            method: 'POST',
            operationId: '',
            parameters: [
              {
                description: '',
                in: 'path',
                name: 'id',
                required: true,
                schema: 'string',
              },
              {
                description: '',
                in: 'query',
                name: 'includePosts',
                required: false,
                schema: 'boolean',
              },
              {
                description: '',
                in: 'header',
                name: 'X-Trace',
                required: false,
                schema: 'string',
              },
              {
                description: '',
                in: 'cookie',
                name: 'session',
                required: false,
                schema: 'string',
              },
            ],
            path: '/users/{id}',
            requestBody: {
              description: '',
              mediaTypes: [
                {
                  contentType: 'application/json',
                  examples: ['{"name":"Ada"}'],
                  generatedExample: '',
                  schema: 'object { name }',
                },
              ],
              required: true,
            },
            responses: [],
            serverUrl: 'https://api.example.com/v1',
            summary: 'Create user',
          },
        ]}
        isValid
      />,
    );

    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByRole('button', { name: /Create user/i }));

    fireEvent.change(screen.getByLabelText(/path: id/), { target: { value: '42' } });
    fireEvent.change(screen.getByLabelText(/query: includePosts/), { target: { value: 'true' } });
    fireEvent.change(screen.getByLabelText(/header: X-Trace/), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/cookie: session/), { target: { value: 'token' } });
    await user.click(screen.getByRole('button', { name: 'executeButton' }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/try-it-out',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      body: '{"name":"Ada"}',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'session=token',
        'X-Trace': 'abc',
      },
      method: 'POST',
      url: 'https://api.example.com/v1/users/42?includePosts=true',
    });
    expect(await screen.findByText('200 OK')).toBeInTheDocument();
    expect(
      screen.getByText(JSON.stringify({ ok: true }, null, 2), { normalizer: (text) => text }),
    ).toBeInTheDocument();
    expect(screen.getByText('content-type: application/json')).toBeInTheDocument();
  });

  it('maps server error codes to translated viewer messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ errorCode: 'blockedUrl' }),
        ok: false,
      }),
    );

    renderViewer(
      <SwaggerViewer
        endpoints={[
          {
            description: '',
            method: 'GET',
            operationId: '',
            parameters: [],
            path: '/internal',
            requestBody: null,
            responses: [],
            serverUrl: 'http://127.0.0.1',
            summary: 'Internal endpoint',
          },
        ]}
        isValid
      />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Internal endpoint/i }));
    await user.click(screen.getByRole('button', { name: 'executeButton' }));

    expect(await screen.findByText('tryItOutBlockedUrl')).toBeInTheDocument();
  });
});
