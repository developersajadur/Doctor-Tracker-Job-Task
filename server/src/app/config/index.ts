import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/doctor_tracker',
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  jwt_token_secret: process.env.JWT_ACCESS_SECRET || 'super_secret_jwt_access_key_doctor_tracker_2026',
  jwt_token_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_doctor_tracker_2026',
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
};
