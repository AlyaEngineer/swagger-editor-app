import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SwaggerEndpoint } from '@/utils/swagger-editor/get-swagger-endpoints';

import { ToastProvider } from '@/providers/toast-provider/ToastProvider';

import { TryItOutPanel } from './try-it-out-panel';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const endpoint: SwaggerEndpoint = {
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
  ],
  path: '/users/{id}',
  requestBody: {
    contentTypes: ['application/json'],
    description: '',
    examples: ['{"name":"Ada"}'],
    required: true,
    schema: 'object { name }',
  },
  responses: [],
  serverUrl: 'https://api.example.com',
  summary: 'Create user',
};

function renderPanel() {
  return render(
    <ToastProvider>
      <TryItOutPanel endpoint={endpoint} />
    </ToastProvider>,
  );
}

describe('TryItOutPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks cURL generation until required fields are filled', async () => {
    const user = userEvent.setup();

    renderPanel();

    await user.clear(screen.getByLabelText('requestBodyInputLabel'));
    await user.click(screen.getByRole('button', { name: 'generateCurlButton' }));

    expect(screen.getByText('tryItOutMissingRequiredFields')).toBeInTheDocument();
    expect(screen.queryByText('curlCommandLabel')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/path: id/), '42');
    fireEvent.change(screen.getByLabelText('requestBodyInputLabel'), {
      target: { value: '{"name":"Ada"}' },
    });
    await user.click(screen.getByRole('button', { name: 'generateCurlButton' }));

    expect(screen.getByText('curlCommandLabel')).toBeInTheDocument();
  });

  it('ignores duplicate submit while execution is already in progress', async () => {
    const fetchMock = vi.fn(() => new Promise(() => undefined));
    const user = userEvent.setup();

    vi.stubGlobal('fetch', fetchMock);
    renderPanel();

    await user.type(screen.getByLabelText(/path: id/), '42');
    await user.click(screen.getByRole('button', { name: 'executeButton' }));
    fireEvent.submit(screen.getByRole('form', { name: 'tryItOutTitle' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps proxy validation errors in the panel without a network toast', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ errorCode: 'blockedUrl' }),
        ok: false,
      }),
    );
    renderPanel();

    await user.type(screen.getByLabelText(/path: id/), '42');
    await user.click(screen.getByRole('button', { name: 'executeButton' }));

    expect(await screen.findByText('tryItOutBlockedUrl')).toBeInTheDocument();
    expect(screen.queryByText('requestNetworkError')).not.toBeInTheDocument();
  });
});
