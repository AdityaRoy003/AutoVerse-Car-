import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[Autoverse Server] Server running on http://localhost:${PORT}`);
    console.log(`[Autoverse Server] Dealership headquarters: Lucknow, UP, India`);
  });
}

bootstrap().catch((err) => {
  console.error('[Autoverse Server] Bootstrap error:', err);
});

