import { z } from 'zod';
import { PATIENT_CONDITIONS, PATIENT_GENDERS } from './patient.constant';

const createPatientValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Patient name is required' }).min(2, 'Name must be at least 2 characters'),
    age: z.number({ required_error: 'Age is required' }).min(0, 'Age must be 0 or greater').max(130, 'Invalid age'),
    gender: z.enum(PATIENT_GENDERS, { required_error: 'Gender is required' }),
    phone: z.string({ required_error: 'Phone number is required' }).min(7, 'Invalid phone number'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    condition: z.enum(PATIENT_CONDITIONS, { required_error: 'Condition is required' }),
    doctorId: z.string({ required_error: 'Doctor ID is required' }),
    admissionDate: z.string().optional(),
    diagnosisNotes: z.string().optional(),
  }),
});

const updatePatientValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    age: z.number().min(0).max(130).optional(),
    gender: z.enum(PATIENT_GENDERS).optional(),
    phone: z.string().min(7).optional(),
    email: z.string().email().optional().or(z.literal('')),
    condition: z.enum(PATIENT_CONDITIONS).optional(),
    doctorId: z.string().optional(),
    admissionDate: z.string().optional(),
    diagnosisNotes: z.string().optional(),
  }),
});

const addPatientToDoctorValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Patient name is required' }).min(2, 'Name must be at least 2 characters'),
    age: z.number({ required_error: 'Age is required' }).min(0, 'Age must be 0 or greater').max(130, 'Invalid age'),
    gender: z.enum(PATIENT_GENDERS, { required_error: 'Gender is required' }),
    phone: z.string({ required_error: 'Phone number is required' }).min(7, 'Invalid phone number'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    condition: z.enum(PATIENT_CONDITIONS, { required_error: 'Condition is required' }).optional(),
    admissionDate: z.string().optional(),
    diagnosisNotes: z.string().optional(),
  }),
});

export const PatientValidation = {
  createPatientValidationSchema,
  updatePatientValidationSchema,
  addPatientToDoctorValidationSchema,
};

