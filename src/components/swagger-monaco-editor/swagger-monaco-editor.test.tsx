import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SwaggerMonacoEditor } from './swagger-monaco-editor';

const mockUseColorScheme = vi.fn();

vi.mock('@mui/material/styles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material/styles')>();

  return {
    ...actual,
    useColorScheme: () => mockUseColorScheme(),
  };
});

let mockModel: null | Record<string, unknown> = {};

vi.mock('@monaco-editor/react', () => ({
  default: ({
    onChange,
    onMount,
    theme,
    value,
  }: {
    onChange: (value: string) => void;
    onMount: (editor: unknown, monaco: unknown) => void;
    theme: string;
    value: string;
  }) => {
    let currentLanguage = 'plaintext';

    const editor = {
      getModel: () => mockModel,
    };

    const monaco = {
      editor: {
        setModelLanguage: (_model: unknown, language: string) => {
          currentLanguage = language;
        },
      },
    };

    onMount(editor, monaco);

    return (
      <textarea
        aria-label={`monaco-${currentLanguage}`}
        data-theme={theme}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    );
  },
}));

describe('SwaggerMonacoEditor', () => {
  beforeEach(() => {
    mockModel = {};
    mockUseColorScheme.mockReturnValue({ mode: 'light', systemMode: 'light' });
  });

  it('mounts without crashing and passes the correct syntax highlighting language', async () => {
    render(<SwaggerMonacoEditor format="yaml" onChange={vi.fn()} value="openapi: 3.0.0" />);

    expect(await screen.findByLabelText('monaco-yaml')).toBeInTheDocument();
  });

  it('passes the json language when format="json"', async () => {
    render(<SwaggerMonacoEditor format="json" onChange={vi.fn()} value="{}" />);

    expect(await screen.findByLabelText('monaco-json')).toBeInTheDocument();
  });

  it('displays the passed value', async () => {
    render(<SwaggerMonacoEditor format="yaml" onChange={vi.fn()} value="openapi: 3.0.0" />);

    expect(await screen.findByLabelText('monaco-yaml')).toHaveValue('openapi: 3.0.0');
  });

  it('calls onChange when text is entered/pasted', async () => {
    const onChange = vi.fn();

    render(<SwaggerMonacoEditor format="json" onChange={onChange} value="" />);
    const editor = await screen.findByLabelText('monaco-json');

    fireEvent.change(editor, { target: { value: '{"a":1}' } });

    expect(onChange).toHaveBeenCalledWith('{"a":1}');
  });

  it('updates the language when the format prop changes', async () => {
    const { rerender } = render(
      <SwaggerMonacoEditor format="yaml" onChange={vi.fn()} value="openapi: 3.0.0" />,
    );

    expect(await screen.findByLabelText('monaco-yaml')).toBeInTheDocument();

    rerender(<SwaggerMonacoEditor format="json" onChange={vi.fn()} value="{}" />);

    expect(await screen.findByLabelText('monaco-json')).toBeInTheDocument();
  });

  it('does not throw when the editor model is not available', async () => {
    mockModel = null;

    render(<SwaggerMonacoEditor format="yaml" onChange={vi.fn()} value="openapi: 3.0.0" />);

    expect(await screen.findByLabelText('monaco-plaintext')).toBeInTheDocument();
  });

  it('uses the dark Monaco theme when the resolved color scheme is dark', async () => {
    mockUseColorScheme.mockReturnValue({ mode: 'dark', systemMode: 'light' });

    render(<SwaggerMonacoEditor format="yaml" onChange={vi.fn()} value="openapi: 3.0.0" />);

    const editor = await screen.findByLabelText('monaco-yaml');
    expect(editor).toHaveAttribute('data-theme', 'vs-dark');
  });

  it('uses the light Monaco theme when the resolved color scheme is light', async () => {
    mockUseColorScheme.mockReturnValue({ mode: 'light', systemMode: 'dark' });

    render(<SwaggerMonacoEditor format="yaml" onChange={vi.fn()} value="openapi: 3.0.0" />);

    const editor = await screen.findByLabelText('monaco-yaml');
    expect(editor).toHaveAttribute('data-theme', 'vs');
  });

  it('falls back to systemMode when mode is "system"', async () => {
    mockUseColorScheme.mockReturnValue({ mode: 'system', systemMode: 'dark' });

    render(<SwaggerMonacoEditor format="yaml" onChange={vi.fn()} value="openapi: 3.0.0" />);

    const editor = await screen.findByLabelText('monaco-yaml');
    expect(editor).toHaveAttribute('data-theme', 'vs-dark');
  });
});
