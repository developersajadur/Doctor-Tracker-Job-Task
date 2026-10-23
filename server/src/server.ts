import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server;

async function bootstrap() {
  try {
    console.log('🔄 Connecting to MongoDB at:', config.database_url);
    await mongoose.connect(config.database_url);
    console.log('✅ Connected to MongoDB successfully.');

    server = app.listen(config.port, () => {
      console.log(`🚀 Doctor Tracker Server listening on port ${config.port}`);
      console.log(`🌐 API Endpoint: http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log('Server closed gracefully.');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error: unknown) => {
    console.error('💥 Unhandled error detected:', error);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Gracefully closing server...');
    if (server) {
      server.close();
    }
  });
}

bootstrap();
