import express from 'express';
import { PatientController } from './patient.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PatientValidation } from './patient.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.staff),
  PatientController.getAllPatients,
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.staff),
  PatientController.getSinglePatient,
);

router.post(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(PatientValidation.createPatientValidationSchema),
  PatientController.createPatient,
);

router.put(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(PatientValidation.updatePatientValidationSchema),
  PatientController.updatePatient,
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  PatientController.deletePatient,
);

export const PatientRoutes = router;
