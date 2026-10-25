// Сгенерировано scripts/sync-error-codes.mjs из backend/core/error_codes.py — не править руками.
// Обновить: npm run sync:error-codes

export const ERROR_CODES = [
  'INTERNAL_ERROR',
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'UNPROCESSABLE_ENTITY',
  'VALIDATION_ERROR',
  'INVALID_JSON',
  'BAD_CREDENTIALS',
  'IMAGE_NOT_FOUND',
  'ENERGY_DRINK_NOT_FOUND',
  'REVIEW_NOT_FOUND',
  'USER_NOT_FOUND',
  'EMAIL_ALREADY_EXISTS',
  'USERNAME_ALREADY_EXISTS',
  'INVALID_PASSWORD',
  'VERIFIED_USER_REQUIRED',
  'ADMIN_REQUIRED',
  'REVIEW_NOT_OWNER',
  'REVIEW_ALREADY_EXISTS',
  'CONTENT_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]
