import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation';

const STRONG = 'a'.repeat(48);

describe('validateEnv', () => {
  it('aceita config válida', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'postgres://x', JWT_ACCESS_SECRET: STRONG }),
    ).not.toThrow();
  });

  it('rejeita JWT_ACCESS_SECRET em falta', () => {
    expect(() => validateEnv({ DATABASE_URL: 'postgres://x' })).toThrow();
  });

  it('rejeita segredo demasiado curto', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'postgres://x', JWT_ACCESS_SECRET: 'short' }),
    ).toThrow();
  });

  it('rejeita valor de exemplo inseguro', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'postgres://x',
        JWT_ACCESS_SECRET: 'change-me-access',
      }),
    ).toThrow();
  });

  it('rejeita DATABASE_URL em falta', () => {
    expect(() => validateEnv({ JWT_ACCESS_SECRET: STRONG })).toThrow();
  });

  it('rejeita JWT_REFRESH_SECRET de exemplo', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'postgres://x',
        JWT_ACCESS_SECRET: STRONG,
        JWT_REFRESH_SECRET: 'change-me-refresh',
      }),
    ).toThrow();
  });
});
