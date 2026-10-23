import { TTokenUser } from '../middlewares/auth';

declare global {
  namespace Express {
    interface Request {
      user?: TTokenUser;
    }
  }
}
