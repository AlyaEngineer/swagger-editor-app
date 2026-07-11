import { describe, expect, it } from 'vitest';

import { signInSchema, signUpSchema } from './auth-schemas';

describe('signInSchema', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: 'anything' });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = signInSchema.safeParse({ email: 'not-an-email', password: 'anything' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('invalidEmail');
  });

  it('rejects an empty password', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('passwordRequired');
  });
});

describe('signUpSchema', () => {
  it('accepts a valid name, email, and strong password', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: 'Jon Snow',
      password: 'Qwerty1!',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: '',
      password: 'Qwerty1!',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('nameRequired');
  });

  it('shows passwordRequired, not passwordTooShort, for an empty password', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: 'Jon Snow',
      password: '',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('passwordRequired');
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: 'Jon Snow',
      password: 'Aa1!',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('passwordTooShort');
  });

  it('rejects a password without a letter', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: 'Jon Snow',
      password: '12345678!',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message === 'passwordMissingLetter')).toBe(
      true,
    );
  });

  it('rejects a password without a digit', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: 'Jon Snow',
      password: 'Password!',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message === 'passwordMissingDigit')).toBe(
      true,
    );
  });

  it('rejects a password without a special character', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: 'Jon Snow',
      password: 'Password1',
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.message === 'passwordMissingSpecialChar'),
    ).toBe(true);
  });

  it('accepts a password with unicode letters', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      name: 'Jon Snow',
      password: 'Пароль1!',
    });

    expect(result.success).toBe(true);
  });
});
