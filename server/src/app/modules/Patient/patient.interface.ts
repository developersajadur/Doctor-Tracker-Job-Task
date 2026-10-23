import { Model, Types } from 'mongoose';

export type TPatientCondition =
  | 'Stable'
  | 'Critical'
  | 'Recovering'
  | 'Under Observation';

export type TPatientGender = 'Male' | 'Female' | 'Other';

export interface IPatient {
  _id?: Types.ObjectId;
  name: string;
  age: number;
  gender: TPatientGender;
  phone: string;
  email?: string;
  condition: TPatientCondition;
  doctorId: Types.ObjectId;
  admissionDate: Date;
  diagnosisNotes?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PatientModel = Model<IPatient>;
