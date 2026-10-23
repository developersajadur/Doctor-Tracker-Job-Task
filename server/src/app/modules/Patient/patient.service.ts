import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Patient } from './patient.model';
import { IPatient } from './patient.interface';
import { Doctor } from '../Doctor/doctor.model';
import QueryBuilder from '../../builders/QueryBuilder';
import { patientSearchableFields } from './patient.constant';

const getAllPatientsFromDB = async (query: Record<string, unknown>) => {
  const patientQuery = new QueryBuilder(
    Patient.find({ isDeleted: false }).populate('doctorId', 'name specialization hospital email phone'),
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
    meta,
    result,
  };
};

const getSinglePatientFromDB = async (id: string) => {
  const patient = await Patient.findOne({ _id: id, isDeleted: false })
    .populate('doctorId', 'name specialization hospital email phone')
    .lean();

  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND, 'Patient record not found!');
  }

  return patient;
};

const createPatientIntoDB = async (payload: IPatient) => {
  const doctor = await Doctor.findOne({ _id: payload.doctorId, isDeleted: false });
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assigned Doctor not found!');
  }

  const result = await Patient.create(payload);

  // Increment doctor's active patient count
  await Doctor.findByIdAndUpdate(payload.doctorId, {
    $inc: { activePatientCount: 1 },
  });

  return result;
};

const updatePatientIntoDB = async (id: string, payload: Partial<IPatient>) => {
  const patient = await Patient.findOne({ _id: id, isDeleted: false });
  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND, 'Patient record not found!');
  }

  // If doctorId is being changed, handle recount on both doctors
  if (payload.doctorId && payload.doctorId.toString() !== patient.doctorId.toString()) {
    const newDoctor = await Doctor.findOne({ _id: payload.doctorId, isDeleted: false });
    if (!newDoctor) {
      throw new AppError(httpStatus.NOT_FOUND, 'New assigned doctor not found!');
    }

    // Decrement old doctor
    await Doctor.findByIdAndUpdate(patient.doctorId, {
      $inc: { activePatientCount: -1 },
    });

    // Increment new doctor
    await Doctor.findByIdAndUpdate(payload.doctorId, {
      $inc: { activePatientCount: 1 },
    });
  }

  const result = await Patient.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('doctorId', 'name specialization hospital email');

  return result;
};

const deletePatientFromDB = async (id: string) => {
  const patient = await Patient.findOne({ _id: id, isDeleted: false });
  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND, 'Patient record not found!');
  }

  patient.isDeleted = true;
  await patient.save();

  // Decrement doctor's active patient count
  await Doctor.findByIdAndUpdate(patient.doctorId, {
    $inc: { activePatientCount: -1 },
  });

  return patient;
};

export const PatientService = {
  getAllPatientsFromDB,
  getSinglePatientFromDB,
  createPatientIntoDB,
  updatePatientIntoDB,
  deletePatientFromDB,
};
