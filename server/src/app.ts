import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import v1Router from './routes/v1';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(globalLimiter);

app.get('/health', async (_req, res, next) => {
  try {
    let dbStatus: 'ok' | 'error' | 'unconfigured' = 'unconfigured';
    let dbLatency: number | undefined;

    if (env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
      const start = Date.now();
      const response = await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
        headers: { apikey: env.SUPABASE_SECRET_KEY },
      });
      dbStatus = response.ok ? 'ok' : 'error';
      dbLatency = Date.now() - start;
    }

    const overallStatus = dbStatus === 'error' ? 'degraded' : 'ok';

    res.status(overallStatus === 'ok' ? 200 : 207).json({
      status: overallStatus,
      env: env.NODE_ENV,
      uptime_s: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          provider: 'supabase',
          ...(dbLatency !== undefined && { latency_ms: dbLatency }),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

app.use('/api/v1', v1Router);

app.use(errorHandler);

export default app;
