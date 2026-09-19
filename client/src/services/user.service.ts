import { api } from '../lib/api';
import type { User } from '../types';

export async function fetchDevelopers(): Promise<User[]> {
  const { data } = await api.get('/developers');
  return (data.data as { developers: User[] }).developers;
}
