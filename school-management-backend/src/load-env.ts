import { join } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: join(process.cwd(), '.env') });
loadEnv({ path: join(process.cwd(), '.env.local'), override: true });
