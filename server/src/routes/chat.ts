import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth } from './auth.js';
import { pool } from '../db.js';
import { buildChatPrompt } from '../prompt.js';
import { generateText } from '../services/gemini.js';

export const chatRouter = Router();

chatRouter.use(requireAuth);

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  userMessage: z.string().min(1).max(4000),
});

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

  const userId = (req as AuthenticatedRequest).userId;
  const { sessionId, userMessage } = parsed.data;

  try {
    // 查询 session
    const sessionRes = await pool.query<{ scenario: string }>(
      'select scenario from sessions where id = $1 and user_id = $2',
      [sessionId, userId]
    );

    if (sessionRes.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        },
      });
    }

    const scenario = sessionRes.rows[0].scenario;

    // 查询历史
    const historyRes = await pool.query(
      'select role, content from messages where session_id = $1 order by created_at asc',
      [sessionId]
    );

    const history = historyRes.rows;

    // 构建 prompt
    const promptText = buildChatPrompt(scenario, history, userMessage);

    // 保存用户消息
    await pool.query(
      'insert into messages (id, session_id, role, content) values ($1, $2, $3, $4)',
      [uuidv4(), sessionId, 'user', userMessage]
    );

    // 调用 Gemini（HTTP fetch）
    const assistantMessage = await generateText(promptText);

    if (!assistantMessage) {
      return res.status(502).json({
        error: {
          code: 'MODEL_EMPTY_RESPONSE',
          message: 'Model returned empty response',
        },
      });
    }

    // 保存 AI 回复
    await pool.query(
      'insert into messages (id, session_id, role, content) values ($1, $2, $3, $4)',
      [uuidv4(), sessionId, 'assistant', assistantMessage]
    );

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