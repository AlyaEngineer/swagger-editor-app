'use client';

import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Props = {
  editorValue: string;
  format: 'json' | 'yaml';
  handleFormatToggle: () => void;
  isValid: boolean;
  setError: (message: string) => void;
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

  async function handleSaveSchema() {
    if (!isAuthenticated || !isValid) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/schema', {
        body: JSON.stringify({
          content: editorValue,
          format,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to save schema');
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save schema');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <FormControlLabel
        control={<Switch checked={format === 'yaml'} onChange={handleFormatToggle} />}
        disabled={!isValid || isSaving}
        label={format === 'yaml' ? 'YAML' : 'JSON'}
      />

      {isAuthenticated && (
        <Button disabled={!isValid || isSaving} onClick={handleSaveSchema} variant="contained">
          {isSaving ? t('saving') : t('saveButton')}
        </Button>
      )}
    </Stack>
  );
};
