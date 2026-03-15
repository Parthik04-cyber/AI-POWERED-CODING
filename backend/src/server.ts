import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/auth';
import { ensureDefaultAdminAccount } from './services/adminBootstrapService';

import authRoutes from './routes/authRoutes';
import problemRoutes from './routes/problemRoutes';
import submissionRoutes from './routes/submissionRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import executeRoutes from './routes/executeRoutes';
import storeRoutes from './routes/storeRoutes';
import contestRoutes from './routes/contestRoutes';
import courseRoutes from './routes/courseRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  if ((process.env.NODE_ENV || 'development') !== 'production') {
    return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
  }

  return false;
};

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin || 'unknown'}`));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/courses', courseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const adminSetup = await ensureDefaultAdminAccount();
    if (adminSetup.created) {
      console.log(`✓ Default admin created: ${adminSetup.email}`);
    } else if (adminSetup.updated) {
      console.log(`✓ Default admin updated: ${adminSetup.email}`);
    } else {
      console.log(`✓ Default admin already exists: ${adminSetup.email}`);
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

export default app;
