import { env } from './env.js';

const allowedOrigins = env.CLIENT_URL.split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

export function isAllowedOrigin(origin: string | undefined): boolean {
  return !origin || allowedOrigins.includes(origin.replace(/\/$/, ''));
}
