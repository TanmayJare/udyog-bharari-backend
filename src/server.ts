import * as dotenv from 'dotenv';
dotenv.config();
import app from './app';
import connectDB from './config/database';
import { createInitialAdmin } from './controllers/authController';

// Initialize once
let initialized = false;
async function initialize() {
  if (initialized) return;
  await connectDB();
  await createInitialAdmin();
  initialized = true;
}

// Vercel handler
export default async function handler(req, res) {
  try {
    await initialize();
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Local dev
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}
