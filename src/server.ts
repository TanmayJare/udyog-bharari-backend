import * as dotenv from 'dotenv';
dotenv.config();
import app from './app';
import connectDB from './config/database';
import { createInitialAdmin } from './controllers/authController';

const PORT = process.env.PORT || 5000;

// Initialize once
let initialized = false;
async function initialize() {
  if (initialized) return;
  await connectDB();
  await createInitialAdmin();
  initialized = true;
}

// For Vercel
export default async (req, res) => {
  await initialize();
  return app(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}
