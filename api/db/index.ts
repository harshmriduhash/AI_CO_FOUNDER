// api/db/index.ts
import { sql } from '@vercel/postgres';

export const db = {
  users: {
    create: async (data: { email: string; name: string; passwordHash: string }) => {
      try {
        const result = await sql`
          INSERT INTO users (email, name, password_hash)
          VALUES (${data.email}, ${data.name}, ${data.passwordHash})
          RETURNING id, email, name;
        `;
        return result.rows[0];
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    },

    findByEmail: async (email: string) => {
      try {
        const result = await sql`
          SELECT id, email, name, password_hash
          FROM users
          WHERE email = ${email};
        `;
        return result.rows[0];
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    }
  },

  subscriptions: {
    create: async (data: { userId: string; plan: string; status: string; expiresAt: Date }) => {
      try {
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan, status, expires_at)
          VALUES (${data.userId}, ${data.plan}, ${data.status}, ${data.expiresAt})
          RETURNING *;
        `;
        return result.rows[0];
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    },

    findByUserId: async (userId: string) => {
      try {
        const result = await sql`
          SELECT *
          FROM subscriptions
          WHERE user_id = ${userId}
          AND status = 'active'
          AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1;
        `;
        return result.rows[0];
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    }
  }
};