'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { AppLinkButton } from '@/components/app-link/app-link';
import { AuthCard } from '@/components/auth-card/auth-card';
import { ControlledTextField } from '@/components/controlled-text-field/controlled-text-field';
import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/client';
import { useToast } from '@/providers/toast-provider/ToastProvider';
import { type SignUpFormValues, signUpSchema } from '@/utils/auth/auth-schemas';

export default function SignUpForm() {
  const t = useTranslations('authForm');
  const tToast = useTranslations('toaster');
  const showToast = useToast();
  const router = useRouter();

  const methods = useForm<SignUpFormValues>({
    defaultValues: { email: '', name: '', password: '' },
    mode: 'onBlur',
    resolver: zodResolver(signUpSchema),
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  async function onSubmit(values: SignUpFormValues) {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      options: {
        data: { full_name: values.name },
      },
      password: values.password,
    });

    if (error) {
      showToast(tToast('signUpError'), 'error');
      return;
    }

    showToast(tToast('signUpSuccess'), 'success');
    router.push(ROUTES.home);
  }

  return (
    <AuthCard
      footer={
        <Typography sx={{ textAlign: 'center' }}>
          {t('alreadyHaveAccount')}{' '}
          <AppLinkButton href={ROUTES.signIn}>{t('signInLink')}</AppLinkButton>
        </Typography>
      }
      title={t('signUpTitle')}
    >
      <FormProvider {...methods}>
        <Box
          autoComplete="off"
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            '& .MuiButton-root': { fontSize: '14px', height: '40px', py: 0 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
          }}
        >
          <ControlledTextField
            autoComplete="name"
            autoFocus
            error={errors.name}
            labelKey="nameLabel"
            name="name"
            placeholder={t('namePlaceholder')}
          />

          <ControlledTextField
            autoComplete="email"
            error={errors.email}
            labelKey="emailLabel"
            name="email"
            placeholder="your@email.com"
            type="email"
          />

          <ControlledTextField
            autoComplete="new-password"
            error={errors.password}
            labelKey="passwordLabel"
            name="password"
            placeholder="••••••"
            type="password"
          />

          <Button
            disabled={isSubmitting}
            fullWidth
            sx={{ mt: 1 }}
            type="submit"
            variant="contained"
          >
            {t('signUpButton')}
          </Button>
        </Box>
      </FormProvider>
    </AuthCard>
  );
}
