import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from './page';

const mockRestoreSchemaForCurrentUser = vi.fn();

vi.mock('@/services/schema-server-service', () => ({
  restoreSchemaForCurrentUser: () => mockRestoreSchemaForCurrentUser(),
}));

vi.mock('@components', () => ({
  SwaggerEditor: ({ initialSchema }: { initialSchema: unknown }) => (
    <pre data-testid="initial-schema">{JSON.stringify(initialSchema)}</pre>
  ),
}));

describe('Home page', () => {
  it('passes the restored schema to the editor as the initial prop', async () => {
    const schema = {
      content: 'openapi: 3.0.0\ninfo:\n  title: Restored',
      format: 'yaml',
    };

    mockRestoreSchemaForCurrentUser.mockResolvedValue(schema);

    render(await Home());

    expect(screen.getByTestId('initial-schema').textContent).toBe(JSON.stringify(schema));
  });
});
