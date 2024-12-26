import express from 'express';
import { sql } from '@vercel/postgres';
import cors from 'cors';
import { hash, compare } from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());
app.use(cors());

// Rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize database
async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ideas (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      key_features JSONB,
      target_audience TEXT,
      revenue_model TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

initDatabase().catch(console.error);

// Auth endpoints
app.post('/api/auth/signup', 
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    try {
      const hashedPassword = await hash(password, 10);
      await sql`INSERT INTO users (email, password, name) VALUES (${email}, ${hashedPassword}, ${name})`;
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ error: 'User creation failed' });
    }
});

app.post('/api/auth/login', 
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      const user = result.rows[0];
      if (user && await compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
});

// Ideas endpoints
app.post('/api/ideas', 
  limiter,
  authenticate,
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('keyFeatures').isArray(),
  body('targetAudience').notEmpty(),
  body('revenueModel').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, keyFeatures, targetAudience, revenueModel } = req.body;
    const userId = req.user.userId;
    try {
      const result = await sql`
        INSERT INTO ideas (user_id, title, description, key_features, target_audience, revenue_model)
        VALUES (${userId}, ${title}, ${description}, ${JSON.stringify(keyFeatures)}, ${targetAudience}, ${revenueModel})
        RETURNING id
      `;
      res.status(201).json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Idea creation error:', error);
      res.status(400).json({ error: 'Idea creation failed' });
    }
});

app.get('/api/ideas', limiter, authenticate, async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const result = await sql`
      SELECT * FROM ideas
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const totalCount = await sql`SELECT COUNT(*) FROM ideas WHERE user_id = ${userId}`;
    res.json({
      ideas: result.rows.map(idea => ({ ...idea, keyFeatures: idea.key_features })),
      totalCount: parseInt(totalCount.rows[0].count),
      currentPage: page,
      totalPages: Math.ceil(parseInt(totalCount.rows[0].count) / limit)
    });
  } catch (error) {
    console.error('Fetch ideas error:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

app.put('/api/ideas/:id', 
  limiter,
  authenticate,
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('keyFeatures').isArray(),
  body('targetAudience').notEmpty(),
  body('revenueModel').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, keyFeatures, targetAudience, revenueModel } = req.body;
    const userId = req.user.userId;

    try {
      const result = await sql`
        UPDATE ideas
        SET title = ${title}, description = ${description}, key_features = ${JSON.stringify(keyFeatures)},
            target_audience = ${targetAudience}, revenue_model = ${revenueModel}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Idea not found or unauthorized' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update idea error:', error);
      res.status(500).json({ error: 'Failed to update idea' });
    }
});

app.delete('/api/ideas/:id', limiter, authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await sql`
      DELETE FROM ideas
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Idea not found or unauthorized' });
    }
    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

// Documents endpoints
app.post('/api/documents', 
  limiter,
  authenticate,
  body('type').notEmpty(),
  body('title').notEmpty(),
  body('content').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, title, content } = req.body;
    const userId = req.user.userId;
    try {
      const result = await sql`
        INSERT INTO documents (user_id, type, title, content)
        VALUES (${userId}, ${type}, ${title}, ${JSON.stringify(content)})
        RETURNING id
      `;
      res.status(201).json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Document creation error:', error);
      res.status(400).json({ error: 'Document creation failed' });
    }
});

app.get('/api/documents', limiter, authenticate, async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const result = await sql`
      SELECT * FROM documents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const totalCount = await sql`SELECT COUNT(*) FROM documents WHERE user_id = ${userId}`;
    res.json({
      documents: result.rows,
      totalCount: parseInt(totalCount.rows[0].count),
      currentPage: page,
      totalPages: Math.ceil(parseInt(totalCount.rows[0].count) / limit)
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.put('/api/documents/:id', 
  limiter,
  authenticate,
  body('type').notEmpty(),
  body('title').notEmpty(),
  body('content').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { type, title, content } = req.body;
    const userId = req.user.userId;

    try {
      const result = await sql`
        UPDATE documents
        SET type = ${type}, title = ${title}, content = ${JSON.stringify(content)}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found or unauthorized' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update document error:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
});

app.delete('/api/documents/:id', limiter, authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await sql`
      DELETE FROM documents
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or unauthorized' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default app;

