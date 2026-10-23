import { Doctor } from '../Doctor/doctor.model';
import { Patient } from '../Patient/patient.model';

const getDashboardAnalyticsFromDB = async () => {
  // 1. Total Doctors and Patients
  const [totalDoctors, totalPatients, criticalPatients, recoveringPatients] =
    await Promise.all([
      Doctor.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ condition: 'Critical', isDeleted: false }),
      Patient.countDocuments({ condition: 'Recovering', isDeleted: false }),
    ]);

  const avgPatientsPerDoctor =
    totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(1)) : 0;

  // 2. Patient Condition Distribution
  const conditionDistribution = await Patient.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$condition',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        condition: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  // 3. Top Doctors by Patient Load (for Bar Chart)
  const patientsPerDoctor = await Doctor.aggregate([
    { $match: { isDeleted: false } },
    {
      $project: {
        _id: 1,
        name: 1,
        specialization: 1,
        hospital: 1,
        patientCount: '$activePatientCount',
      },
    },
    { $sort: { patientCount: -1 } },
    { $limit: 8 },
  ]);

  // 4. Monthly Patient Admissions Timeline (Last 6-12 Months)
  const admissionsTimeline = await Patient.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: {
          year: { $year: '$admissionDate' },
          month: { $month: '$admissionDate' },
        },
        admissions: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
    {
      $project: {
        _id: 0,
        monthYear: {
          $concat: [
            {
              $arrayElemAt: [
                [
                  '',
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                '$_id.month',
              ],
            },
            ' ',
            { $substr: ['$_id.year', 2, 2] },
          ],
        },
        admissions: 1,
      },
    },
  ]);

  // 5. Hospital Network Distribution
  const hospitalDistribution = await Doctor.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$hospital',
        doctorCount: { $sum: 1 },
        totalPatients: { $sum: '$activePatientCount' },
      },
    },
    {
      $project: {
        _id: 0,
        hospital: '$_id',
        doctorCount: 1,
        totalPatients: 1,
      },
    },
    { $sort: { totalPatients: -1 } },
    { $limit: 6 },
  ]);

  // 6. Specialization Distribution
  const specializationDistribution = await Doctor.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$specialization',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        specialization: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return {
    overview: {
      totalDoctors,
      totalPatients,
      criticalPatients,
      recoveringPatients,
      avgPatientsPerDoctor,
    },
    conditionDistribution,
    patientsPerDoctor,
    admissionsTimeline,
    hospitalDistribution,
    specializationDistribution,
  };
};

export const AnalyticsService = {
  getDashboardAnalyticsFromDB,
};
