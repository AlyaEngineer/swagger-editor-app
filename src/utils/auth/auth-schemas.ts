import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: 'emailRequired' })
  .pipe(z.email({ message: 'invalidEmail' }));

const passwordSchema = z
  .string()
  .min(1, { message: 'passwordRequired' })
  .min(PASSWORD_MIN_LENGTH, { message: 'passwordTooShort' })
  .regex(/\p{L}/u, { message: 'passwordMissingLetter' })
  .regex(/\d/, { message: 'passwordMissingDigit' })
  .regex(/[^\p{L}\d\s]/u, { message: 'passwordMissingSpecialChar' });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'passwordRequired' }),
});

export const signUpSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1, { message: 'nameRequired' }),
  password: passwordSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
