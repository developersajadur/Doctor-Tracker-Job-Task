import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from '../helpers/catchAsync';
import { User } from '../modules/User/user.model';
import { verifyToken } from '../helpers/jwtHelper';
import config from '../config';
import { TUserRole } from '../modules/User/user.constant';

export type TTokenUser = {
  userId: string;
  email: string;
  role: TUserRole;
  name?: string;
  iat: number;
  exp: number;
};

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(
    async (
      req: Request & { user?: TTokenUser },
      _res: Response,
      next: NextFunction,
    ) => {
      let token: string | undefined;

      if (req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
          token = req.headers.authorization.split(' ')[1];
        } else {
          token = req.headers.authorization;
        }
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized! Token is missing.');
      }

      let verifiedUser: TTokenUser;
      try {
        verifiedUser = verifyToken(
          token,
          config.jwt_token_secret,
        ) as TTokenUser;
      } catch (err: any) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token.');
      }

      const user = await User.findById(verifiedUser.userId);
      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User not found!');
      }
      if (user.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
      }
      if (user.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
      }

      if (verifiedUser.exp && Date.now() >= verifiedUser.exp * 1000) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token expired.');
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(verifiedUser.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'You are not allowed to access this resource!',
        );
      }

      req.user = verifiedUser;
      next();
    },
  );
};

export default auth;
