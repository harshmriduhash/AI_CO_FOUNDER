import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hash } from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from '../db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await hash(password, 10);
    const user = await db.users.create({ email, name, passwordHash });

    // Create a free trial subscription
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

    const subscription = await db.subscriptions.create({
      userId: user.id,
      plan: 'starter',
      status: 'active',
      expiresAt: trialEnd
    });

    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      subscription
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}