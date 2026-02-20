import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { authRouter } from './routes/auth.js';
import { sessionsRouter } from './routes/sessions.js';
import { chatRouter } from './routes/chat.js';

const app = express();

const frontendUrl = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: frontendUrl ? ['http://localhost:5173', frontendUrl] : ['http://localhost:5173'],
    credentials: false,
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/chat', chatRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    },
  });
});

const port = Number(process.env.PORT || 3000);

async function start() {
  await pool.query('select 1');
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
