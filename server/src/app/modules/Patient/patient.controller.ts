import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { PatientService } from './patient.service';

const getAllPatients = catchAsync(async (req, res) => {
  const result = await PatientService.getAllPatientsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patients retrieved successfully!',
    meta: result.meta,
    data: result.result,
  });
});

const getSinglePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.getSinglePatientFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient retrieved successfully!',
    data: result,
  });
});

const createPatient = catchAsync(async (req, res) => {
  const result = await PatientService.createPatientIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Patient registered successfully!',
    data: result,
  });
});

const updatePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.updatePatientIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient details updated successfully!',
    data: result,
  });
});

const deletePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.deletePatientFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient deleted successfully!',
    data: result,
  });
});

export const PatientController = {
  getAllPatients,
  getSinglePatient,
  createPatient,
  updatePatient,
  deletePatient,
};
