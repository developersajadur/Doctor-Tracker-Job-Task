import { z } from 'zod';

const createDoctorValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Doctor name is required' }).min(2, 'Name must be at least 2 characters'),
    specialization: z.string({ required_error: 'Specialization is required' }).min(2, 'Specialization is required'),
    hospital: z.string({ required_error: 'Hospital name is required' }).min(2, 'Hospital is required'),
    phone: z.string({ required_error: 'Phone number is required' }).min(7, 'Invalid phone number'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  }),
});

const updateDoctorValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    specialization: z.string().min(2).optional(),
    hospital: z.string().min(2).optional(),
    phone: z.string().min(7).optional(),
    email: z.string().email().optional(),
  }),
});

export const DoctorValidation = {
  createDoctorValidationSchema,
  updateDoctorValidationSchema,
};
