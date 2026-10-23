import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { UserService } from './user.service';
import config from '../../config';

const loginUser = catchAsync(async (req, res) => {
  const result = await UserService.loginUser(req.body);

  const { refreshToken, accessToken, user } = result;

  res.cookie('token', accessToken, {
    secure: config.node_env === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    secure: config.node_env === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: {
      user,
      token: accessToken,
    },
  });
});

const createUser = catchAsync(async (req, res) => {
  const result = await UserService.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully!',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await UserService.getMe(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully!',
    data: result,
  });
});

const logoutUser = catchAsync(async (_req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged out successfully!',
    data: null,
  });
});

export const UserController = {
  loginUser,
  createUser,
  getMe,
  logoutUser,
};
