import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './app/config';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

import mongoose from 'mongoose';

const app: Application = express();

// Security & Parsing Middlewares
app.use(helmet());

const allowedOrigins = [
  config.client_url,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://doctor-tracker-pro.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless DB connection check
app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(config.database_url, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (error) {
      console.error('Serverless MongoDB connection error:', error);
    }
  }
  next();
});

if (config.node_env === 'development') {
  app.use(morgan('dev'));
}

// Health Check & Welcome Route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Doctor Tracker REST API Service is actively running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
  });
});

// Application Routes
app.use('/api/v1', router);

// Error Handling Middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
