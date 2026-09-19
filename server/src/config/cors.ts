import { env } from './env.js';

const allowedOrigins = [env.CLIENT_URL, env.FRONTEND_URL]
  .filter((origin): origin is string => Boolean(origin))
  .flatMap((origin) => origin.split(','))
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

export function isAllowedOrigin(origin: string | undefined): boolean {
  return !origin || allowedOrigins.includes(origin.replace(/\/$/, ''));
}
