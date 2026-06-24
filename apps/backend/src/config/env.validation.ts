/**
 * Validação das variáveis de ambiente no arranque ("fail closed").
 *
 * Se um segredo crítico faltar ou for um valor de exemplo conhecido, a API
 * recusa arrancar em vez de usar um fallback inseguro — evita que um deploy mal
 * configurado fique a assinar/validar JWTs com um segredo público.
 */

/** Valores por omissão/exemplo que NUNCA podem ser usados como segredo real. */
const INSECURE_SECRETS = new Set(
  [
    'dev-access-secret',
    'dev-refresh-secret',
    'change-me-access',
    'change-me-refresh',
    'muda-isto-em-producao-access',
    'muda-isto-em-producao-refresh',
    'secret',
    'changeme',
    'change-me',
  ].map((s) => s.toLowerCase()),
);

const MIN_SECRET_LENGTH = 32;

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];

  if (typeof config.DATABASE_URL !== 'string' || !config.DATABASE_URL) {
    errors.push('DATABASE_URL em falta.');
  }

  const access = config.JWT_ACCESS_SECRET;
  if (typeof access !== 'string' || access.length < MIN_SECRET_LENGTH) {
    errors.push(
      `JWT_ACCESS_SECRET em falta ou demasiado curto (mínimo ${MIN_SECRET_LENGTH} caracteres). ` +
        'Gera um valor aleatório, ex.: openssl rand -hex 32',
    );
  } else if (INSECURE_SECRETS.has(access.toLowerCase())) {
    errors.push(
      'JWT_ACCESS_SECRET tem um valor de exemplo inseguro — gera um segredo aleatório.',
    );
  }

  // O refresh token é opaco (não é um JWT), por isso JWT_REFRESH_SECRET é
  // opcional; mas se estiver definido não pode ser um valor de exemplo.
  const refresh = config.JWT_REFRESH_SECRET;
  if (
    typeof refresh === 'string' &&
    refresh.length > 0 &&
    INSECURE_SECRETS.has(refresh.toLowerCase())
  ) {
    errors.push(
      'JWT_REFRESH_SECRET tem um valor de exemplo inseguro — gera um segredo aleatório.',
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuração de ambiente inválida:\n - ${errors.join('\n - ')}`,
    );
  }

  return config;
}
