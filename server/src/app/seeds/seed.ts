import mongoose from 'mongoose';
import config from '../config';
import { User } from '../modules/User/user.model';
import { Doctor } from '../modules/Doctor/doctor.model';
import { Patient } from '../modules/Patient/patient.model';
import { USER_ROLE } from '../modules/User/user.constant';
import { TPatientCondition, TPatientGender } from '../modules/Patient/patient.interface';

const doctorsData = [
  {
    name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiology',
    hospital: 'Evercare Hospital',
    phone: '+1 415-555-0101',
    email: 'sarah.jenkins@hospital.org',
  },
  {
    name: 'Dr. Marcus Vance',
    specialization: 'Neurology',
    hospital: 'Apollo Medical Center',
    phone: '+1 415-555-0102',
    email: 'marcus.vance@hospital.org',
  },
  {
    name: 'Dr. Emily Thornton',
    specialization: 'Pediatrics',
    hospital: 'Square Hospital',
    phone: '+1 415-555-0103',
    email: 'emily.thornton@hospital.org',
  },
  {
    name: 'Dr. David Kim',
    specialization: 'Orthopedics',
    hospital: 'United Healthcare',
    phone: '+1 415-555-0104',
    email: 'david.kim@hospital.org',
  },
  {
    name: 'Dr. Elena Rostova',
    specialization: 'Oncology',
    hospital: 'Metropolitan Clinic',
    phone: '+1 415-555-0105',
    email: 'elena.rostova@hospital.org',
  },
  {
    name: 'Dr. James Harrison',
    specialization: 'Dermatology',
    hospital: 'Evercare Hospital',
    phone: '+1 415-555-0106',
    email: 'james.harrison@hospital.org',
  },
  {
    name: 'Dr. Priya Patel',
    specialization: 'Gynecology',
    hospital: 'Apollo Medical Center',
    phone: '+1 415-555-0107',
    email: 'priya.patel@hospital.org',
  },
  {
    name: 'Dr. Robert Chen',
    specialization: 'General Medicine',
    hospital: 'Square Hospital',
    phone: '+1 415-555-0108',
    email: 'robert.chen@hospital.org',
  },
  {
    name: 'Dr. Aisha Al-Mansoor',
    specialization: 'Gastroenterology',
    hospital: 'United Healthcare',
    phone: '+1 415-555-0109',
    email: 'aisha.almansoor@hospital.org',
  },
  {
    name: 'Dr. Thomas Bradley',
    specialization: 'Psychiatry',
    hospital: 'Metropolitan Clinic',
    phone: '+1 415-555-0110',
    email: 'thomas.bradley@hospital.org',
  },
  {
    name: 'Dr. Linda Zimmerman',
    specialization: 'Cardiology',
    hospital: 'Square Hospital',
    phone: '+1 415-555-0111',
    email: 'linda.zimmerman@hospital.org',
  },
  {
    name: 'Dr. Tariq Rahman',
    specialization: 'Neurology',
    hospital: 'Evercare Hospital',
    phone: '+1 415-555-0112',
    email: 'tariq.rahman@hospital.org',
  },
  {
    name: 'Dr. Clara Oswald',
    specialization: 'Pediatrics',
    hospital: 'Apollo Medical Center',
    phone: '+1 415-555-0113',
    email: 'clara.oswald@hospital.org',
  },
  {
    name: 'Dr. Alexander Hayes',
    specialization: 'Orthopedics',
    hospital: 'Metropolitan Clinic',
    phone: '+1 415-555-0114',
    email: 'alexander.hayes@hospital.org',
  },
  {
    name: 'Dr. Maya Lin',
    specialization: 'Oncology',
    hospital: 'United Healthcare',
    phone: '+1 415-555-0115',
    email: 'maya.lin@hospital.org',
  },
];

const patientNames = [
  'Arthur Pendelton', 'Liam O’Connor', 'Sophia Martinez', 'Noah Washington', 'Emma Watson',
  'Oliver Queen', 'Isabella Garcia', 'Lucas Scott', 'Mia Khalifa', 'Elijah Wood',
  'Charlotte Bronte', 'Benjamin Franklin', 'Amelia Earhart', 'Mason Mount', 'Harper Lee',
  'Ethan Hunt', 'Evelyn Salt', 'James Bond', 'Abigail Adams', 'Alexander Hamilton',
  'Emily Dickinson', 'Daniel Craig', 'Elizabeth Bennett', 'Henry Cavill', 'Avery Brooks',
  'Sebastian Stan', 'Scarlett Johansson', 'Jack Sparrow', 'Victoria Secret', 'Owen Wilson',
  'Chloe Decker', 'Wyatt Earp', 'Penelope Cruz', 'John Wick', 'Riley Reid',
  'Luke Skywalker', 'Layla Hassan', 'Gabriel Macht', 'Zoey Deschanel', 'Anthony Stark',
  'Nora Allen', 'Isaac Newton', 'Hannah Abbott', 'Julian Assange', 'Grace Hopper',
  'Levi Ackerman', 'Zoe Kravitz', 'David Beckham', 'Stella McCartney', 'Caleb McLaughlin',
  'Ruby Rose', 'Ryan Gosling', 'Serena Williams', 'Bruce Wayne', 'Diana Prince',
  'Peter Parker', 'Natasha Romanoff', 'Steve Rogers', 'Wanda Maximoff', 'Stephen Strange'
];

const conditions: TPatientCondition[] = ['Stable', 'Critical', 'Recovering', 'Under Observation'];
const genders: TPatientGender[] = ['Male', 'Female', 'Other'];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await mongoose.connect(config.database_url);
    console.log('✅ Connected to MongoDB.');

    // 1. Seed Admin & Staff Users
    console.log('👤 Seeding Administrative users...');
    await User.deleteMany({});

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@doctortracker.com',
      password: 'admin123',
      role: USER_ROLE.admin,
    });

    await User.create({
      name: 'Clinical Staff Member',
      email: 'staff@doctortracker.com',
      password: 'staff123',
      role: USER_ROLE.staff,
    });
    console.log(`✅ Admin created: ${admin.email} (Password: admin123)`);

    // 2. Seed Doctors
    console.log('👨‍⚕️ Seeding Doctors...');
    await Doctor.deleteMany({});
    const createdDoctors = await Doctor.insertMany(doctorsData);
    console.log(`✅ Created ${createdDoctors.length} doctors.`);

    // 3. Seed Patients
    console.log('🏥 Seeding Patients...');
    await Patient.deleteMany({});

    const patientsToInsert = [];
    const now = new Date();

    for (let i = 0; i < patientNames.length; i++) {
      const assignedDoctor = createdDoctors[i % createdDoctors.length];
      const condition = conditions[i % conditions.length];
      const gender = genders[i % genders.length];
      const age = 18 + Math.floor(Math.random() * 65);
      
      // Distribute admission date across the last 180 days
      const daysAgo = Math.floor(Math.random() * 180);
      const admissionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      patientsToInsert.push({
        name: patientNames[i],
        age,
        gender,
        phone: `+1 555-01${(100 + i).toString().slice(-2)}`,
        email: `${patientNames[i].toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
        condition,
        doctorId: (assignedDoctor as any)._id,
        admissionDate,
        diagnosisNotes: `Standard diagnosis evaluation for ${assignedDoctor.specialization.toLowerCase()} conditions. Initial monitoring active.`,
        isDeleted: false,
      });
    }

    await Patient.insertMany(patientsToInsert);
    console.log(`✅ Created ${patientsToInsert.length} patients.`);

    // 4. Update Doctors activePatientCount
    for (const doc of createdDoctors) {
      const count = await Patient.countDocuments({ doctorId: (doc as any)._id, isDeleted: false });
      await Doctor.findByIdAndUpdate((doc as any)._id, { activePatientCount: count });
    }
    console.log('✅ Updated patient counts per doctor.');

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
