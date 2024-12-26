// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { sql } from '@vercel/postgres';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-development');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    console.log('Attempting login for email:', email);

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user directly with SQL query
    const userResult = await sql`
      SELECT id, email, name, password_hash
      FROM users
      WHERE email = ${email}
    `;

    const user = userResult.rows[0];

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await compare(password, user.password_hash);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get subscription
    const subscriptionResult = await sql`
      SELECT *
      FROM subscriptions
      WHERE user_id = ${user.id}
      AND status = 'active'
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const subscription = subscriptionResult.rows[0];

    // Generate JWT
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    console.log('Login successful for user:', email);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      subscription
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}