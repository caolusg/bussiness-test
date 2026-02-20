import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AuthedRequest, requireAuth } from '../auth.js';
import { pool } from '../db.js';

const createSessionSchema = z.object({
  title: z.string().max(200).optional(),
  scenario: z.string().min(1).max(4000),
});

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

sessionsRouter.post('/', async (req, res) => {
  const parsed = createSessionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid session payload',
      },
    });
  }

  const userId = (req as AuthedRequest).userId;
  const sessionId = uuidv4();

  try {
    await pool.query('insert into sessions (id, user_id, title, scenario) values ($1, $2, $3, $4)', [
      sessionId,
      userId,
      parsed.data.title ?? null,
      parsed.data.scenario,
    ]);

    return res.status(201).json({ sessionId });
  } catch {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create session',
      },
    });
  }
});

sessionsRouter.get('/', async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  try {
    const result = await pool.query<{ id: string; title: string | null; scenario: string; createdat: string }>(
      `select id, title, scenario, created_at as "createdAt"
       from sessions
       where user_id = $1
       order by created_at desc`,
      [userId]
    );

    return res.json(result.rows);
  } catch {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch sessions',
      },
    });
  }
});

sessionsRouter.get('/:id/messages', async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const sessionId = req.params.id;

  try {
    const sessionCheck = await pool.query('select id from sessions where id = $1 and user_id = $2', [sessionId, userId]);

    if (!sessionCheck.rows[0]) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        },
      });
    }

    const result = await pool.query<{
      id: string;
      role: 'system' | 'user' | 'assistant';
      content: string;
      createdAt: string;
    }>(
      `select id, role, content, created_at as "createdAt"
       from messages
       where session_id = $1
       order by created_at asc`,
      [sessionId]
    );

    return res.json(result.rows);
  } catch {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch messages',
      },
    });
  }
});
