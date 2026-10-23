import { NextFunction, Request, Response } from 'express';
import { z, ZodError, ZodType } from 'zod';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

/**
 * Validation middleware factory
 * Validates request against a Zod schema
 */
export const validateRequest = (schema: any) => {
  const zodSchema = schema instanceof ZodType ? schema : z.object(schema);
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Parse all parts of the request
      const validationResult = await zodSchema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
        headers: req.headers,
      });

      // Attach parsed data to request
      if (validationResult.body) {
        req.body = validationResult.body;
      }
      if (validationResult.query) {
        Object.assign(req.query, validationResult.query);
      }
      if (validationResult.params) {
        Object.assign(req.params, validationResult.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        const errorMessage = formattedErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(', ');

        next(
          new AppError(
            httpStatus.BAD_REQUEST,
            `Validation error: ${errorMessage}`,
            formattedErrors,
          ),
        );
      } else {
        next(
          new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Error validating request',
          ),
        );
      }
    }
  };
};

/**
 * Simplified validation middleware for body only
 */
export const validateBody = (schema: any) => {
  return validateRequest({
    body: schema,
  });
};

/**
 * Simplified validation middleware for query params only
 */
export const validateQuery = (schema: any) => {
  return validateRequest({
    query: schema,
  });
};

/**
 * Simplified validation middleware for route params only
 */
export const validateParams = (schema: any) => {
  return validateRequest({
    params: schema,
  });
};

export default validateRequest;
