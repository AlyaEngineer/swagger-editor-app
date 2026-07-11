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
import { type SignInFormValues, signInSchema } from '@/utils/auth/auth-schemas';

export default function SignInForm() {
  const t = useTranslations('authForm');
  const tToast = useTranslations('toaster');
  const showToast = useToast();
  const router = useRouter();

  const methods = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(signInSchema),
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  async function onSubmit(values: SignInFormValues) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      showToast(tToast('signInError'), 'error');
      return;
    }

    router.push(ROUTES.home);
  }

  return (
    <AuthCard
      footer={
        <Typography sx={{ textAlign: 'center' }}>
          {t('noAccount')} <AppLinkButton href={ROUTES.signUp}>{t('signUpLink')}</AppLinkButton>
        </Typography>
      }
      title={t('signInTitle')}
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
            autoComplete="email"
            autoFocus
            error={errors.email}
            labelKey="emailLabel"
            name="email"
            placeholder="your@email.com"
            type="email"
          />

          <ControlledTextField
            autoComplete="current-password"
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
            {t('signInButton')}
          </Button>
        </Box>
      </FormProvider>
    </AuthCard>
  );
}
