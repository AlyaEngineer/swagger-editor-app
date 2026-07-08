'use client';

import { FormatToggle } from '@components';
import { Button, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useToast } from '@/providers/toast-provider/ToastProvider';
import { saveSchema } from '@/services/schema-service';
import { getSignalWithTimeout } from '@/utils/network/get-signal-with-timeout';
import { SchemaFormat } from '@/utils/swagger-editor/schema-types';

type Props = {
  editorValue: string;
  format: SchemaFormat;
  handleFormatToggle: () => void;
  isValid: boolean;
};

const SAVE_TIMEOUT_MS = 10_000;

export const SwaggerControl = ({ editorValue, format, handleFormatToggle, isValid }: Props) => {
  const [isSaving, setIsSaving] = useState(false);

  const showToast = useToast();
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

    const { cleanup, signal } = getSignalWithTimeout(SAVE_TIMEOUT_MS);

    try {
      await saveSchema({ content: editorValue, format, signal });
      showToast(t('saveSuccess'), 'success');
    } catch (saveError) {
      if (saveError instanceof Error && saveError.name === 'AbortError') {
        showToast(t('timeoutError'), 'error');
      } else {
        showToast(t('saveError'), 'error');
      }
    } finally {
      cleanup();
      setIsSaving(false);
    }
  }

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <FormatToggle
        disabled={isToggleDisabled}
        disabledHint={t('disabledHint')}
        format={format}
        onToggle={handleFormatToggle}
      />

      {isAuthenticated && (
        <Button disabled={isToggleDisabled} onClick={handleSaveSchema} variant="contained">
          {isSaving ? t('saving') : t('saveButton')}
        </Button>
      )}
    </Stack>
  );
};
