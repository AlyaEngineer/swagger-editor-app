import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/providers/toast-provider/ToastProvider';

import { SwaggerEditor } from './swagger-editor';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

vi.mock('@components', () => ({
  FormatToggle: () => <div data-testid="format-toggle-stub" />,
  SwaggerMonacoEditor: () => <div data-testid="monaco-stub" />,
}));

const mockUseSwagger = vi.fn();

vi.mock('@/utils/hooks/use-swagger', () => ({
  useSwagger: () => mockUseSwagger(),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('SwaggerEditor', () => {
  it('shows an error alert when the schema is invalid', () => {
    mockUseSwagger.mockReturnValue({
      editorValue: '',
      error: 'Something is wrong',
      format: 'yaml',
      handleEditorChange: vi.fn(),
      handleFormatToggle: vi.fn(),
      isValid: false,
      schema: null,
    });

    renderWithProviders(<SwaggerEditor />);

    expect(screen.getByText('Something is wrong')).toBeInTheDocument();
  });

  it('shows a success alert with the endpoint count when the schema is valid', () => {
    mockUseSwagger.mockReturnValue({
      editorValue: '',
      error: null,
      format: 'yaml',
      handleEditorChange: vi.fn(),
      handleFormatToggle: vi.fn(),
      isValid: true,
      schema: { paths: { '/users': { get: {} } } },
    });

    renderWithProviders(<SwaggerEditor />);

    expect(screen.getByText(/schemaValid/)).toBeInTheDocument();
  });
});
