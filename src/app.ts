
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
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://udyog-bharari-2026.vercel.app'
      ];
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith('.vercel.app') || 
                        origin.includes('localhost');
                        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());

// Middleware to handle API prefixing
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

app.use('/registrations', registrationsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/auth', authRoutes);
app.use('/webhooks', webhooksRoutes);

app.get('/health', (req, res) => {
  res.json({ message: 'Server is running', url: req.url });
});

app.use(errorHandler);

export default app;
