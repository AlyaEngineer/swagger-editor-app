'use client';

import { FormatToggle } from '@components';
import { Button, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useAuth } from '@/providers/auth-provider/AuthProvider';
import { useToast } from '@/providers/toast-provider/ToastProvider';
import { SchemaService } from '@/services/schema-service';
import { getSignalWithTimeout } from '@/utils/network/get-signal-with-timeout';
import { type SchemaFormat } from '@/utils/swagger-editor/schema-types';

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
  const tToast = useTranslations('toaster');
  const { isAuthenticated } = useAuth();

  const isToggleDisabled = !isValid || isSaving;

  async function handleSaveSchema() {
    if (!isAuthenticated || !isValid) {
      return;
    }

    setIsSaving(true);

    const { cleanup, signal } = getSignalWithTimeout(SAVE_TIMEOUT_MS);

    try {
      await SchemaService.save({ content: editorValue, format, signal });
      showToast(tToast('schemaSaveSuccess'), 'success');
    } catch (saveError) {
      if (saveError instanceof Error && saveError.name === 'AbortError') {
        showToast(tToast('requestTimeoutError'), 'error');
      } else {
        showToast(tToast('schemaSaveError'), 'error');
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
