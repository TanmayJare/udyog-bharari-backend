import * as dotenv from 'dotenv';
dotenv.config();
import app from './app';
import connectDB from './config/database';
import { createInitialAdmin } from './controllers/authController';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await createInitialAdmin();
  
  // Only listen if we're not on Vercel
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

startServer();

export default app;
