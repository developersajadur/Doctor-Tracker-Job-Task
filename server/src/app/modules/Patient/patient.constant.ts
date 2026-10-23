export const patientSearchableFields = [
  'name',
  'phone',
  'email',
];

export const patientFilterableFields = [
  'search',
  'searchTerm',
  'condition',
  'gender',
  'doctorId',
  'startDate',
  'endDate',
];

export const PATIENT_CONDITIONS = [
  'Stable',
  'Critical',
  'Recovering',
  'Under Observation',
] as const;

export const PATIENT_GENDERS = ['Male', 'Female', 'Other'] as const;
