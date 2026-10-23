import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Doctor } from './doctor.model';
import { IDoctor } from './doctor.interface';
import { Patient } from '../Patient/patient.model';
import QueryBuilder from '../../builders/QueryBuilder';
import { doctorSearchableFields } from './doctor.constant';
import { patientSearchableFields } from '../Patient/patient.constant';
import { IPatient } from '../Patient/patient.interface';

const getAllDoctorsFromDB = async (query: Record<string, unknown>) => {
  const doctorQuery = new QueryBuilder(
    Doctor.find({ isDeleted: false }),
    query,
  )
    .search(doctorSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await doctorQuery.modelQuery.lean();
  const meta = await doctorQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleDoctorFromDB = async (id: string) => {
  const doctor = await Doctor.findOne({ _id: id, isDeleted: false }).lean();
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Doctor not found!');
  }

  // Get live patient count and recent 5 patients
  const totalPatients = await Patient.countDocuments({ doctorId: id, isDeleted: false });
  const recentPatients = await Patient.find({ doctorId: id, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    ...doctor,
    activePatientCount: totalPatients,
    recentPatients,
  };
};

const createDoctorIntoDB = async (payload: IDoctor) => {
  const existingDoctor = await Doctor.findOne({ email: payload.email });
  if (existingDoctor) {
    if (existingDoctor.isDeleted) {
      existingDoctor.isDeleted = false;
      existingDoctor.name = payload.name;
      existingDoctor.specialization = payload.specialization;
      existingDoctor.hospital = payload.hospital;
      existingDoctor.phone = payload.phone;
      await existingDoctor.save();
      return existingDoctor;
    }
    throw new AppError(httpStatus.CONFLICT, 'Doctor with this email already exists!');
  }

  const result = await Doctor.create(payload);
  return result;
};

const updateDoctorIntoDB = async (id: string, payload: Partial<IDoctor>) => {
  const doctor = await Doctor.findOne({ _id: id, isDeleted: false });
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Doctor not found!');
  }

  if (payload.email && payload.email !== doctor.email) {
    const existing = await Doctor.findOne({ email: payload.email, _id: { $ne: id } });
    if (existing) {
      throw new AppError(httpStatus.CONFLICT, 'Doctor with this email already exists!');
    }
  }

  const result = await Doctor.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteDoctorFromDB = async (id: string) => {
  const doctor = await Doctor.findOne({ _id: id, isDeleted: false });
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Doctor not found!');
  }

  doctor.isDeleted = true;
  await doctor.save();

  // Mark all patients of this doctor as unassigned or soft deleted
  await Patient.updateMany({ doctorId: id }, { isDeleted: true });

  return doctor;
};

const getDoctorPatientsFromDB = async (
  doctorId: string,
  query: Record<string, unknown>,
) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isDeleted: false });
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Doctor not found!');
  }

  const patientQuery = new QueryBuilder(
    Patient.find({ doctorId, isDeleted: false }),
    query,
  )
    .search(patientSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await patientQuery.modelQuery.lean();
  const meta = await patientQuery.countTotal();

  return {
    doctor,
    meta,
    result,
  };
};

const addPatientToDoctorIntoDB = async (
  doctorId: string,
  payload: Omit<IPatient, 'doctorId'>,
) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isDeleted: false });
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Doctor not found!');
  }

  const patient = await Patient.create({
    ...payload,
    doctorId,
  });

  // Increment doctor's patient count
  await Doctor.findByIdAndUpdate(doctorId, {
    $inc: { activePatientCount: 1 },
  });

  return patient;
};

const deletePatientFromDoctorFromDB = async (
  doctorId: string,
  patientId: string,
) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isDeleted: false });
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Doctor not found!');
  }

  const patient = await Patient.findOne({
    _id: patientId,
    doctorId,
    isDeleted: false,
  });

  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND, 'Patient not found under this doctor!');
  }

  patient.isDeleted = true;
  await patient.save();

  // Decrement doctor's patient count
  await Doctor.findByIdAndUpdate(doctorId, {
    $inc: { activePatientCount: -1 },
  });

  return patient;
};

export const DoctorService = {
  getAllDoctorsFromDB,
  getSingleDoctorFromDB,
  createDoctorIntoDB,
  updateDoctorIntoDB,
  deleteDoctorFromDB,
  getDoctorPatientsFromDB,
  addPatientToDoctorIntoDB,
  deletePatientFromDoctorFromDB,
};
