import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import habitsRoutes from './routes/habits.routes.js';
import completionsRoutes from './routes/completions.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// Public auth routes
app.use('/api/auth', authRoutes);

// All routes below require a valid JWT
app.use('/api/habits', authenticate, habitsRoutes);
app.use('/api/completions', authenticate, completionsRoutes);
app.use('/api/settings', authenticate, settingsRoutes);

app.use(errorHandler);

export default app;
