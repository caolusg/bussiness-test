import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AuthedRequest, requireAuth } from '../auth.js';
import { pool } from '../db.js';
import { buildChatPrompt } from '../prompt.js';
import { generateText } from '../services/gemini.js';

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  userMessage: z.string().min(1).max(4000),
});

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.post('/', async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid chat payload',
      },
    });
  }

  const userId = (req as AuthedRequest).userId;
  const { sessionId, userMessage } = parsed.data;

  try {
    const sessionRes = await pool.query<{ scenario: string }>(
      'select scenario from sessions where id = $1 and user_id = $2',
      [sessionId, userId]
    );

    const session = sessionRes.rows[0];

    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        },
      });
    }

    const historyRes = await pool.query<{ role: 'system' | 'user' | 'assistant'; content: string }>(
      `select role, content
       from messages
       where session_id = $1
       order by created_at desc
       limit 20`,
      [sessionId]
    );

    const history = historyRes.rows.reverse();
    const promptText = buildChatPrompt(session.scenario, history, userMessage);

    await pool.query('insert into messages (id, session_id, role, content) values ($1, $2, $3, $4)', [
      uuidv4(),
      sessionId,
      'user',
      userMessage,
    ]);

    const assistantMessage = await generateText(promptText);

    if (!assistantMessage) {
      return res.status(502).json({
        error: {
          code: 'MODEL_EMPTY_RESPONSE',
          message: 'Model returned empty response',
        },
      });
    }

    await pool.query('insert into messages (id, session_id, role, content) values ($1, $2, $3, $4)', [
      uuidv4(),
      sessionId,
      'assistant',
      assistantMessage,
    ]);

    return res.json({ assistantMessage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process chat';
    const code = message.includes('GEMINI_API_KEY is not configured') ? 'CONFIG_ERROR' : 'INTERNAL_ERROR';

    console.error('chat error', error);
    return res.status(500).json({
      error: {
        code,
        message: code === 'CONFIG_ERROR' ? 'GEMINI_API_KEY is not configured' : 'Failed to process chat',
      },
    });
  }
});
