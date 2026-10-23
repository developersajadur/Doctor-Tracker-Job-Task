import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { DoctorService } from './doctor.service';

const getAllDoctors = catchAsync(async (req, res) => {
  const result = await DoctorService.getAllDoctorsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctors retrieved successfully!',
    meta: result.meta,
    data: result.result,
  });
});

const getSingleDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.getSingleDoctorFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor details retrieved successfully!',
    data: result,
  });
});

const createDoctor = catchAsync(async (req, res) => {
  const result = await DoctorService.createDoctorIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Doctor created successfully!',
    data: result,
  });
});

const updateDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.updateDoctorIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor updated successfully!',
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.deleteDoctorFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Doctor deleted successfully!',
    data: result,
  });
});

const getDoctorPatients = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.getDoctorPatientsFromDB(id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor's patients retrieved successfully!",
    meta: result.meta,
    data: result,
  });
});

const addPatientToDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.addPatientToDoctorIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Patient added to doctor successfully!',
    data: result,
  });
});

const deletePatientFromDoctor = catchAsync(async (req, res) => {
  const { id, patientId } = req.params;
  const result = await DoctorService.deletePatientFromDoctorFromDB(id, patientId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient removed from doctor's list successfully!",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctors,
  getSingleDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
  deletePatientFromDoctor,
};
