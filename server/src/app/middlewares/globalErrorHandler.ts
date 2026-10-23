import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../errors/AppError';
import handleValidationError from '../errors/handleValidationError';
import handleDuplicateError from '../errors/handleDuplicateError';
import handleCastError from '../errors/handleCastError';
import { TErrorSources } from '../interface/error';

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  _next,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];
  let errors: any = undefined;

  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Validation Error';
    errorSources = err.issues.map((issue) => ({
      path: issue?.path[issue.path.length - 1] as string,
      message: issue?.message,
    }));
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
    errors = err.errors;
  } else if (err?.name === 'JsonWebTokenError') {
    statusCode = httpStatus.UNAUTHORIZED;
    message = 'Invalid Token';
    errorSources = [{ path: '', message: 'Invalid Token' }];
  } else if (err?.name === 'TokenExpiredError') {
    statusCode = httpStatus.UNAUTHORIZED;
    message = 'Token has expired';
    errorSources = [{ path: '', message: 'Token has expired' }];
  } else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    statusCode = httpStatus.BAD_REQUEST;
    message = `Malformed JSON: ${err.message}`;
    errorSources = [{ path: '', message: err.message }];
  } else if (err instanceof Error) {
    message = err?.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  // Development logging
  if (config.node_env === 'development') {
    console.error('💥 Error Caught in globalErrorHandler:', {
      statusCode,
      message,
      path: req.originalUrl,
      stack: err?.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorSources,
    ...(errors && errors.length > 0 ? { errors } : {}),
    ...(config.node_env === 'development' ? { stack: err?.stack } : {}),
  });
};

export default globalErrorHandler;
