'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Users,
  Plus,
  Trash2,
  Activity,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { DoctorService } from '@/services/doctor.service';
import { formatDate } from '@/lib/utils';
import { IPatient, TPatientCondition, TPatientGender } from '@/types';

const CONDITION_BADGES: Record<string, string> = {
  Stable: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  Recovering: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  'Under Observation': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

function DoctorDetailContent() {
  const params = useParams();
  const queryClient = useQueryClient();
  const doctorId = params.id as string;


  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  // New Patient Form
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: 35,
    gender: 'Male' as TPatientGender,
    phone: '',
    email: '',
    condition: 'Stable' as TPatientCondition,
    admissionDate: new Date().toISOString().split('T')[0],
    diagnosisNotes: '',
  });
  const [formError, setFormError] = useState('');

  // 1. Fetch Doctor details
  const { data: doctorData, isLoading: isDoctorLoading } = useQuery({
    queryKey: ['doctor-details', doctorId],
    queryFn: async () => {
      const res = await DoctorService.getDoctorById(doctorId);
      return res.data;
    },
  });

  // 2. Fetch Doctor's Patients
  const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
    queryKey: ['doctor-patients', doctorId, page, searchTerm],
    queryFn: async () => {
      const res = await DoctorService.getDoctorPatients(doctorId, {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
      });
      return res;
    },
  });

  const doctor = doctorData;
  const patients = patientsData?.data?.result || [];
  const meta = patientsData?.meta;

  // Add Patient to Doctor Mutation
  const addPatientMutation = useMutation({
    mutationFn: async () => {
      return await DoctorService.addPatientToDoctor(doctorId, patientForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor-details', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      setIsAddPatientModalOpen(false);
      setPatientForm({
        name: '',
        age: 35,
        gender: 'Male',
        phone: '',
        email: '',
        condition: 'Stable',
        admissionDate: new Date().toISOString().split('T')[0],
        diagnosisNotes: '',
      });
      setFormError('');
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setFormError(errorObj.response?.data?.message || 'Failed to add patient.');
    },
  });


  // Remove Patient from Doctor Mutation
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      return await DoctorService.deletePatientFromDoctor(doctorId, patientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor-details', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      setDeletePatientId(null);
    },
  });

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.phone) {
      setFormError('Patient Name and Contact Phone are required.');
      return;
    }
    addPatientMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Header
        title={doctor ? `${doctor.name}'s Roster` : 'Physician Details'}
        description="Assigned clinical patients, admission records, and direct caseload management"
      />

      {/* Back button */}
      <div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>
      </div>

      {/* Doctor Profile Banner */}
      {isDoctorLoading ? (
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse h-36" />
      ) : doctor ? (
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-cyan-500/20">
              {doctor.name.replace('Dr. ', '').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {doctor.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {doctor.specialization}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {doctor.hospital}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {doctor.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {doctor.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Patients
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {doctor.activePatientCount ?? 0}
              </span>
            </div>

            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Patient Under Doctor</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Patient List Header & Search */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Assigned Patient Cohort</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patients currently under clinical supervision of this doctor
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients by name/phone..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Patients Table */}
        {isPatientsLoading ? (
          <div className="space-y-2 py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            <Activity className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No patients assigned to this doctor yet
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Enroll Patient Under Doctor&quot; to assign a new patient.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Clinical Condition</th>
                  <th className="py-3 px-4">Admission Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {patients.map((patient: IPatient) => (
                  <tr key={patient._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{patient.name}</div>
                      {patient.diagnosisNotes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {patient.diagnosisNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {patient.age} yrs &bull; {patient.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div>{patient.phone}</div>
                      {patient.email && <div className="text-[11px] text-slate-400 dark:text-slate-500">{patient.email}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          CONDITION_BADGES[patient.condition] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {patient.condition}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {formatDate(patient.admissionDate || patient.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeletePatientId(patient._id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                        title="Remove patient from doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPage > 1 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Page {meta.page} of {meta.totalPage} ({meta.total} patients)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPage))}
                disabled={page >= meta.totalPage}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsAddPatientModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Enroll Patient under {doctor?.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              New patient will be immediately assigned to this physician&apos;s active cohort.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handlePatientSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  placeholder="e.g. Johnathan Doe"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Age *</label>
                  <input
                    type="number"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: Number(e.target.value) })}
                    min="0"
                    max="130"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value as TPatientGender })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
                  <input
                    type="text"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    placeholder="+1 555-0100"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Condition *</label>
                  <select
                    value={patientForm.condition}
                    onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value as TPatientCondition })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Stable">Stable</option>
                    <option value="Critical">Critical</option>
                    <option value="Recovering">Recovering</option>
                    <option value="Under Observation">Under Observation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  placeholder="patient@example.com (optional)"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Diagnosis Notes</label>
                <textarea
                  rows={2}
                  value={patientForm.diagnosisNotes}
                  onChange={(e) => setPatientForm({ ...patientForm, diagnosisNotes: e.target.value })}
                  placeholder="Initial clinical observations..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPatientMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {addPatientMutation.isPending ? 'Enrolling...' : 'Enroll Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Patient Confirmation Modal */}
      {deletePatientId && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-sm w-full p-6 border border-rose-500/30 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Discharge / Remove Patient?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              This patient will be removed from this physician&apos;s active clinical roster.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletePatientId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePatientMutation.mutate(deletePatientId)}
                disabled={deletePatientMutation.isPending}
                className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30 disabled:opacity-50 cursor-pointer"
              >
                {deletePatientMutation.isPending ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-slate-400">Loading Doctor Profile...</div>}>
      <DoctorDetailContent />
    </React.Suspense>
  );
}
