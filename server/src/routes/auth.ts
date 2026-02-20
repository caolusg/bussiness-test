import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { pool } from '../db.js';
import { AuthedRequest, requireAuth, signToken } from '../auth.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email or password (password length must be >= 8)',
      },
    });
  }

  const { email, password } = parsed.data;

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('insert into users (id, email, password_hash) values ($1, $2, $3)', [uuidv4(), email, hash]);
    return res.status(201).json({ ok: true });
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to register user',
      },
    });
  }
});

authRouter.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email or password',
      },
    });
  }

  const { email, password } = parsed.data;

  try {
    const result = await pool.query<{ id: string; password_hash: string }>(
      'select id, password_hash from users where email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
      });
    }

    return res.json({ token: signToken(user.id) });
  } catch {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to login',
      },
    });
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  try {
    const result = await pool.query<{ id: string; email: string }>('select id, email from users where id = $1', [userId]);

    if (!result.rows[0]) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user profile',
      },
    });
  }
});
