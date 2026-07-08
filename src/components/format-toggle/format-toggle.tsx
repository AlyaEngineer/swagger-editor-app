'use client';

import { FormControlLabel, Switch, Tooltip } from '@mui/material';

import { SchemaFormat } from '@/utils/swagger-editor/schema-format';

type FormatToggleProps = {
  disabled: boolean;
  disabledHint: string;
  format: SchemaFormat;
  onToggle: () => void;
};

const tooltipPopperProps = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -5],
        },
      },
    ],
  },
  tooltip: {
    sx: {
      textAlign: 'center',
    },
  },
};

export function FormatToggle({ disabled, disabledHint, format, onToggle }: FormatToggleProps) {
  const toggleControl = (
    <FormControlLabel
      control={<Switch checked={format === 'yaml'} onChange={onToggle} />}
      disabled={disabled}
      label={format === 'yaml' ? 'YAML' : 'JSON'}
    />
  );

  if (!disabled) {
    return toggleControl;
  }

  return (
    <Tooltip describeChild placement="top" slotProps={tooltipPopperProps} title={disabledHint}>
      <span>{toggleControl}</span>
    </Tooltip>
  );
}
