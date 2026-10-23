import { Schema, model } from 'mongoose';
import { IDoctor, DoctorModel } from './doctor.interface';

const doctorSchema = new Schema<IDoctor, DoctorModel>(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    activePatientCount: {
      type: Number,
      default: 0,
      min: 0,
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
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });
doctorSchema.index({ specialization: 1, hospital: 1, createdAt: -1 });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ isDeleted: 1 });

export const Doctor = model<IDoctor, DoctorModel>('Doctor', doctorSchema);
