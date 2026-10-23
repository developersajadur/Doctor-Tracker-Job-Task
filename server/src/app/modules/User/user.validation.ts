import { z } from 'zod';
import { USER_ROLE } from './user.constant';

const loginUserValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  }),
});

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    role: z.enum([USER_ROLE.admin, USER_ROLE.staff] as [string, ...string[]]).optional(),
  }),
});

export const UserValidation = {
  loginUserValidationSchema,
  createUserValidationSchema,
};
