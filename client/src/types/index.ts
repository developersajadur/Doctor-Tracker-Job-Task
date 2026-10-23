export type TUserRole = 'admin' | 'staff';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: TUserRole;
}

export interface IDoctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  activePatientCount?: number;
  recentPatients?: IPatient[];
  createdAt?: string;
  updatedAt?: string;
}

export type TPatientCondition =
  | 'Stable'
  | 'Critical'
  | 'Recovering'
  | 'Under Observation';

export type TPatientGender = 'Male' | 'Female' | 'Other';

export interface IPatient {
  _id: string;
  name: string;
  age: number;
  gender: TPatientGender;
  phone: string;
  email?: string;
  condition: TPatientCondition;
  doctorId: string | IDoctor;
  admissionDate: string;
  diagnosisNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: IPaginationMeta;
  errorSources?: { path: string; message: string }[];
}

export interface IDashboardAnalytics {
  overview: {
    totalDoctors: number;
    totalPatients: number;
    criticalPatients: number;
    recoveringPatients: number;
    avgPatientsPerDoctor: number;
  };
  conditionDistribution: { condition: string; count: number }[];
  patientsPerDoctor: {
    _id: string;
    name: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }[];
  admissionsTimeline: { monthYear: string; admissions: number }[];
  hospitalDistribution: { hospital: string; doctorCount: number; totalPatients: number }[];
  specializationDistribution: { specialization: string; count: number }[];
}
