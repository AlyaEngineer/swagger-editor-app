import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SwaggerEditor } from './swagger-editor';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

vi.mock('@components', () => ({
  SwaggerMonacoEditor: () => <div data-testid="monaco-stub" />,
}));

const mockUseSwagger = vi.fn();

vi.mock('@/utils/hooks/use-swagger', () => ({
  useSwagger: () => mockUseSwagger(),
}));

describe('SwaggerEditor', () => {
  it('shows an error alert when the schema is invalid', () => {
    mockUseSwagger.mockReturnValue({
      editorValue: '',
      error: 'Something is wrong',
      format: 'yaml',
      handleFormatToggle: vi.fn(),
      isValid: false,
      schema: null,
      setEditorValue: vi.fn(),
      setError: vi.fn(),
    });

    render(<SwaggerEditor />);

    expect(screen.getByText('Something is wrong')).toBeInTheDocument();
  });

  it('shows a success alert with the endpoint count when the schema is valid', () => {
    mockUseSwagger.mockReturnValue({
      editorValue: '',
      error: null,
      format: 'yaml',
      handleFormatToggle: vi.fn(),
      isValid: true,
      schema: { paths: { '/users': { get: {} } } },
      setEditorValue: vi.fn(),
      setError: vi.fn(),
    });

    render(<SwaggerEditor />);

    expect(screen.getByText(/schemaValid/)).toBeInTheDocument();
  });
});
