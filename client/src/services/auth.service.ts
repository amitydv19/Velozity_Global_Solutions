import { api, setAccessToken } from '../lib/api';
import type { User } from '../types';

export async function login(
  email: string,
  password: string,
): Promise<{ user: User; accessToken: string }> {
  const { data } = await api.post('/auth/login', { email, password });
  const payload = data.data as { user: User; accessToken: string };
  setAccessToken(payload.accessToken);
  return payload;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
  setAccessToken(null);
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return (data.data as { user: User }).user;
}

export async function bootstrapSession(): Promise<{ user: User; accessToken: string } | null> {
  try {
    const { data } = await api.post('/auth/refresh');
    const payload = data.data as { user: User; accessToken: string };
    setAccessToken(payload.accessToken);
    return payload;
  } catch {
    setAccessToken(null);
    return null;
  }
}
