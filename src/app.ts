
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';
import registrationsRoutes from './routes/registrations';
import paymentsRoutes from './routes/payments';
import authRoutes from './routes/auth';
import webhooksRoutes from './routes/webhooks';

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://udyog-bharari-2026.vercel.app'
    ],
    credentials: true,
  })
);
app.use(express.json());

// Handle both /api and non /api prefixes
app.use(['/api/registrations', '/registrations'], registrationsRoutes);
app.use(['/api/payments', '/payments'], paymentsRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/webhooks', '/webhooks'], webhooksRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use(errorHandler);

export default app;
