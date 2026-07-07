'use client';

import { Button, FormControlLabel, Stack, Switch, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Props = {
  editorValue: string;
  format: 'json' | 'yaml';
  handleFormatToggle: () => void;
  isValid: boolean;
  setError: (message: string) => void;
};

const SAVE_TIMEOUT_MS = 10000;

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

export const SwaggerControl = ({
  editorValue,
  format,
  handleFormatToggle,
  isValid,
  setError,
}: Props) => {
  const [isSaving, setIsSaving] = useState(false);

  const t = useTranslations('swaggerControl');

  // TODO: заменить на рабочую авторизацию
  const { isAuthenticated } = {
    isAuthenticated: true,
  };

  const isToggleDisabled = !isValid || isSaving;

  async function handleSaveSchema() {
    if (!isAuthenticated || !isValid) {
      return;
    }

    setIsSaving(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SAVE_TIMEOUT_MS);

    try {
      const response = await fetch('/api/schema', {
        body: JSON.stringify({ content: editorValue, format }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to save schema');
      }
    } catch (saveError) {
      if (saveError instanceof Error && saveError.name === 'AbortError') {
        setError(t('timeoutError'));
      } else {
        setError(saveError instanceof Error ? saveError.message : 'Failed to save schema');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  }

  const toggleControl = (
    <FormControlLabel
      control={<Switch checked={format === 'yaml'} onChange={handleFormatToggle} />}
      disabled={isToggleDisabled}
      label={format === 'yaml' ? 'YAML' : 'JSON'}
    />
  );

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      {isToggleDisabled ? (
        <Tooltip
          describeChild
          placement="top"
          slotProps={tooltipPopperProps}
          title={t('disabledHint')}
        >
          <span>{toggleControl}</span>
        </Tooltip>
      ) : (
        toggleControl
      )}

      {isAuthenticated && (
        <Button disabled={isToggleDisabled} onClick={handleSaveSchema} variant="contained">
          {isSaving ? t('saving') : t('saveButton')}
        </Button>
      )}
    </Stack>
  );
};
