'use client';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FormControl, FormLabel, IconButton, InputAdornment, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, type FieldError, useFormContext } from 'react-hook-form';

type ControlledTextFieldProps = {
  autoComplete?: string;
  autoFocus?: boolean;
  error?: FieldError;
  labelKey: string;
  name: string;
  placeholder: string;
  type?: string;
};

export function ControlledTextField({
  autoComplete,
  autoFocus,
  error,
  labelKey,
  name,
  placeholder,
  type = 'text',
}: ControlledTextFieldProps) {
  const t = useTranslations('authForm');
  const { control } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const currentType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const passwordToggleButton = (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        edge="end"
        onClick={() => setShowPassword(!showPassword)}
        onMouseDown={(e) => e.preventDefault()}
        size="small"
        type="button"
      >
        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <FormControl fullWidth>
      <FormLabel htmlFor={name}>{t(labelKey)}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field: { ref, ...field } }) => (
          <TextField
            {...field}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            error={!!error}
            helperText={error?.message ? t(error.message) : ' '}
            id={name}
            inputRef={ref}
            placeholder={placeholder}
            slotProps={{
              input: isPasswordType ? { endAdornment: passwordToggleButton } : undefined,
            }}
            sx={{
              '& .MuiInputBase-input': {
                boxSizing: 'border-box',
                fontSize: '14px',
                height: '40px',
                padding: '0 14px',
              },
              '& .MuiInputBase-root': {
                paddingRight: isPasswordType ? '8px' : undefined,
              },
            }}
            type={currentType}
            variant="outlined"
          />
        )}
      />
    </FormControl>
  );
}
