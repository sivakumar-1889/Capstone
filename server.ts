import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApiRouter } from './backend/app.ts';
import { connectDatabase } from './backend/config/db.ts';
import { env } from './backend/config/env.ts';

async function startServer() {
  await connectDatabase();

  const app = express();
  app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use('/api', createApiRouter());

  if (env.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build artifacts not found. Run npm run build first.');
      }
    });
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.info(`[Quizora] Server running on http://0.0.0.0:${env.port}`);
  });
}

startServer().catch((err) => {
  console.error('[Quizora] Fatal startup error:', err);
  process.exit(1);
});
