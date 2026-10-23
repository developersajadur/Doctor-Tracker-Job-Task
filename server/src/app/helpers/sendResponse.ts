import { Response } from 'express';

interface ISendResponse<T> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    totalPage?: number;
    [key: string]: any;
  };
}

/**
 * Standardized response format for all API endpoints
 */
const sendResponse = <T>(
  res: Response,
  { statusCode = 200, success = true, message, data, meta }: ISendResponse<T>,
) => {
  const responseBody: any = {
    success,
    statusCode,
    message,
  };

  if (meta) {
    responseBody.meta = {
      ...meta,
      totalPage: meta.totalPage ?? meta.totalPages,
    };
  }

  if (data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
};

export default sendResponse;
