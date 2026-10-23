export const doctorSearchableFields = [
  'name',
  'specialization',
  'hospital',
  'email',
  'phone',
];

export const doctorFilterableFields = [
  'search',
  'searchTerm',
  'specialization',
  'hospital',
  'startDate',
  'endDate',
];

export const DOCTOR_SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Oncology',
  'Gynecology',
  'General Medicine',
  'Psychiatry',
  'Gastroenterology',
] as const;
