import { Model, Types } from 'mongoose';

export interface IDoctor {
  _id?: Types.ObjectId;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  activePatientCount?: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DoctorModel = Model<IDoctor>;
