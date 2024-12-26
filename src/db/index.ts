import { createClient } from '@libsql/client';

const client = createClient({
  url: 'file:local.db',
});

export const db = {
  async query(sql: string, params: any[] = []) {
    return client.execute(sql, params);
  },
  
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return client.transaction(callback);
  }
};