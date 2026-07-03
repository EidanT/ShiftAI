import 'dotenv/config';
import { env } from './config/env';
import app from './app';
import { logger } from './config/logger';

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);

  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    logger.warn('Supabase no configurado, agrega las credenciales al .env');
  }
});
