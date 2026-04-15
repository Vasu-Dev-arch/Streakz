import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import habitsRoutes from './routes/habits.routes.js';
import completionsRoutes from './routes/completions.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import aiRoutes from './routes/ai.routes.js';
import journalRoutes from './routes/journal.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://streakz-six.vercel.app",
  process.env.CLIENT_ORIGIN
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// Public auth routes
app.use('/api/auth', authRoutes);

// All routes below require a valid JWT
app.use('/api/habits', authenticate, habitsRoutes);
app.use('/api/completions', authenticate, completionsRoutes);
app.use('/api/settings', authenticate, settingsRoutes);
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/journal', authenticate, journalRoutes);
app.use('/api/goals', authenticate, goalsRoutes);

app.use(errorHandler);

export default app;
