import { api } from '../lib/api';
import type { Client } from '../types';

export async function fetchClients(): Promise<Client[]> {
  const { data } = await api.get('/clients');
  return (data.data as { clients: Client[] }).clients;
}
