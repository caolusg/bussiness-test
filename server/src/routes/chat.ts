import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AuthedRequest, requireAuth } from '../auth.js';
import { pool } from '../db.js';
import { buildChatPrompt } from '../prompt.js';

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  userMessage: z.string().min(1).max(4000),
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const geminiClient = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

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

  if (!geminiClient) {
    return res.status(500).json({
      error: {
        code: 'CONFIG_ERROR',
        message: 'GEMINI_API_KEY is not configured',
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
    const prompt = buildChatPrompt(session.scenario, history, userMessage);

    await pool.query('insert into messages (id, session_id, role, content) values ($1, $2, $3, $4)', [
      uuidv4(),
      sessionId,
      'user',
      userMessage,
    ]);

    const result = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const assistantMessage = result.text?.trim();

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
    console.error('chat error', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process chat',
      },
    });
  }
});
