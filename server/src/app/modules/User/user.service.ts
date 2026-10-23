import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from './user.model';
import { IUser } from './user.interface';
import { createToken } from '../../helpers/jwtHelper';
import config from '../../config';

const loginUser = async (payload: { email: string; password: string }) => {
  const user = await User.isUserExistsByEmail(payload.email);
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials! User does not exist.');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This account has been deleted!');
  }

  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This account is blocked!');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password!');
  }

  const jwtPayload = {
    userId: (user as any)._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_token_secret,
    config.jwt_token_expires_in,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  return {
    user: {
      _id: (user as any)._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const createUser = async (payload: IUser) => {
  const isUserExist = await User.findOne({ email: payload.email });
  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, 'User with this email already exists!');
  }

  const result = await User.create(payload);
  return result;
};

const getMe = async (userId: string) => {
  const result = await User.findById(userId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  return result;
};

export const UserService = {
  loginUser,
  createUser,
  getMe,
};
