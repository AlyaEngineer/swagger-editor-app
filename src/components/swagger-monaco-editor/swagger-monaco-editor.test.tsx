import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SwaggerMonacoEditor } from './swagger-monaco-editor';

vi.mock('@monaco-editor/react', () => ({
  default: ({
    onChange,
    onMount,
    value,
  }: {
    onChange: (value: string) => void;
    onMount: (editor: unknown, monaco: unknown) => void;
    value: string;
  }) => {
    let currentLanguage = 'plaintext';

    const model = {};

    const editor = {
      getModel: () => model,
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
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    );
  },
}));

describe('SwaggerMonacoEditor', () => {
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
});
