import express from 'express';
import cors from 'cors';
import habitsRoutes from './routes/habits.routes.js';
import completionsRoutes from './routes/completions.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/habits', habitsRoutes);
app.use('/api/completions', completionsRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);

export default app;
