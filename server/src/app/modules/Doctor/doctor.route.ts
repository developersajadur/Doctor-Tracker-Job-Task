import express from 'express';
import { DoctorController } from './doctor.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DoctorValidation } from './doctor.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.staff),
  DoctorController.getAllDoctors,
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.staff),
  DoctorController.getSingleDoctor,
);

router.post(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(DoctorValidation.createDoctorValidationSchema),
  DoctorController.createDoctor,
);

router.put(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(DoctorValidation.updateDoctorValidationSchema),
  DoctorController.updateDoctor,
);

router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  DoctorController.deleteDoctor,
);

// Doctor specific patients sub-routes
router.get(
  '/:id/patients',
  auth(USER_ROLE.admin, USER_ROLE.staff),
  DoctorController.getDoctorPatients,
);

router.post(
  '/:id/patients',
  auth(USER_ROLE.admin),
  DoctorController.addPatientToDoctor,
);

router.delete(
  '/:id/patients/:patientId',
  auth(USER_ROLE.admin),
  DoctorController.deletePatientFromDoctor,
);

export const DoctorRoutes = router;
