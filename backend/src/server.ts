import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'http';
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
import discussRoutes from './routes/discussRoutes';
import moderationRoutes from './routes/moderationRoutes';

dotenv.config();

const app = express();

const parsePort = (value: string | undefined, fallback = 5000): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    console.warn(`Invalid PORT value "${value}". Falling back to ${fallback}.`);
    return fallback;
  }

  return parsed;
};

const parseNonNegativeInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    console.warn(`Invalid numeric value "${value}". Falling back to ${fallback}.`);
    return fallback;
  }

  return parsed;
};

const REQUESTED_PORT = parsePort(process.env.PORT, 5000);
const AUTO_FIND_PORT = (process.env.AUTO_FIND_PORT || 'true').toLowerCase() !== 'false';
const PORT_RETRY_ATTEMPTS = parseNonNegativeInteger(process.env.PORT_RETRY_ATTEMPTS, 10);

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
app.use('/api/discuss', discussRoutes);
app.use('/api/moderation', moderationRoutes);

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

    const startListening = async (
      initialPort: number,
      retriesRemaining: number
    ): Promise<{ server: Server; port: number }> => {
      try {
        const server = await new Promise<Server>((resolve, reject) => {
          const createdServer = app.listen(initialPort, () => resolve(createdServer));
          createdServer.once('error', reject);
        });

        return { server, port: initialPort };
      } catch (error) {
        const listenError = error as NodeJS.ErrnoException;
        if (listenError.code === 'EADDRINUSE' && AUTO_FIND_PORT && retriesRemaining > 0) {
          const fallbackPort = initialPort + 1;
          console.warn(
            `Port ${initialPort} is in use. Retrying on port ${fallbackPort} (${retriesRemaining} attempts left).`
          );
          return startListening(fallbackPort, retriesRemaining - 1);
        }

        throw error;
      }
    };

    const { port: activePort } = await startListening(REQUESTED_PORT, PORT_RETRY_ATTEMPTS);

    console.log(`✓ Server running on port ${activePort}`);
    if (activePort !== REQUESTED_PORT) {
      console.log(`⚠ Requested port ${REQUESTED_PORT} was unavailable, using ${activePort} instead.`);
    }
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('✗ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

export default app;
