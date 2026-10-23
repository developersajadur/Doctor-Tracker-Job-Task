import { Schema, model } from 'mongoose';
import { IPatient, PatientModel } from './patient.interface';
import { PATIENT_CONDITIONS, PATIENT_GENDERS } from './patient.constant';

const patientSchema = new Schema<IPatient, PatientModel>(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Age exceeds maximum limit'],
    },
    gender: {
      type: String,
      enum: PATIENT_GENDERS,
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    condition: {
      type: String,
      enum: PATIENT_CONDITIONS,
      required: [true, 'Patient condition is required'],
      default: 'Stable',
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Assigned Doctor is required'],
      index: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    diagnosisNotes: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Performance Indexes
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1, admissionDate: -1 });
patientSchema.index({ name: 1, phone: 1 });
patientSchema.index({ name: 'text', email: 'text' });
patientSchema.index({ admissionDate: -1 });
patientSchema.index({ isDeleted: 1 });

export const Patient = model<IPatient, PatientModel>('Patient', patientSchema);
