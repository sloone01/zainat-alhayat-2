import { join } from 'path';

/**
 * Resolve JWT signing secret. Fails hard if unset — never use a hardcoded fallback.
 */
export function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be set in the environment to a strong value (at least 32 characters). Refusing to start with a fallback secret.',
    );
  }
  // Block known leaked placeholder from older commits
  if (
    secret === 'zinat_al_haya_jwt_secret_key_2024_very_secure_random_string' ||
    secret.includes('zinat_al_haya_jwt_secret')
  ) {
    throw new Error(
      'JWT_SECRET matches a previously committed/leaked value. Rotate it before starting the API.',
    );
  }
  return secret;
}

export function resolveCorsOrigins(): boolean | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === '*' || raw === 'true') {
    // Dev convenience only when explicitly unset in non-production
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return true;
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function uploadsRoot(): string {
  return join(process.cwd(), 'uploads');
}
