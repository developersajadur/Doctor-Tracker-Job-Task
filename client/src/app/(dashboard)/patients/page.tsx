'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';

import Header from '@/components/layout/Header';
import { PatientService, IPatientQueryParams } from '@/services/patient.service';
import { DoctorService } from '@/services/doctor.service';
import { IPatient, TPatientCondition, TPatientGender, IDoctor } from '@/types';
import { formatDate } from '@/lib/utils';

const CONDITIONS = ['All', 'Stable', 'Critical', 'Recovering', 'Under Observation'];
const GENDERS = ['All', 'Male', 'Female', 'Other'];

const CONDITION_BADGES: Record<string, string> = {
  Stable: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  Recovering: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  'Under Observation': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

export default function PatientsPage() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedDoctorId, setSelectedDoctorId] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<IPatient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: 35,
    gender: 'Male' as TPatientGender,
    phone: '',
    email: '',
    condition: 'Stable' as TPatientCondition,
    doctorId: '',
    admissionDate: new Date().toISOString().split('T')[0],
    diagnosisNotes: '',
  });
  const [formError, setFormError] = useState('');

  // 300ms Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch all Doctors for dropdown filter and creation
  const { data: doctorsData } = useQuery({
    queryKey: ['all-doctors-lookup'],
    queryFn: async () => {
      const res = await DoctorService.getAllDoctors({ limit: 100 });
      return res.data;
    },
  });

  const doctorsList = doctorsData || [];

  // Query Params for Patients
  const queryParams: IPatientQueryParams = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCondition !== 'All' && { condition: selectedCondition }),
    ...(selectedDoctorId !== 'All' && { doctorId: selectedDoctorId }),
    ...(selectedGender !== 'All' && { gender: selectedGender }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['patients', queryParams],
    queryFn: async () => {
      const res = await PatientService.getAllPatients(queryParams);
      return res;
    },
  });

  const patients: IPatient[] = data?.data || [];
  const meta = data?.meta;


  const savePatientMutation = useMutation({
    mutationFn: async () => {
      if (editingPatient) {
        return PatientService.updatePatient(editingPatient._id, formData);
      }
      return PatientService.createPatient(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      setIsModalOpen(false);
      setEditingPatient(null);
      setFormData({
        name: '',
        age: 35,
        gender: 'Male',
        phone: '',
        email: '',
        condition: 'Stable',
        doctorId: '',
        admissionDate: new Date().toISOString().split('T')[0],
        diagnosisNotes: '',
      });
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setFormError(errorObj.response?.data?.message || 'Failed to process patient record.');
    },
  });


  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => PatientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      setDeletePatientId(null);
    },
  });

  const handleOpenModal = (patientToEdit?: IPatient) => {
    if (patientToEdit) {
      setEditingPatient(patientToEdit);
      const docId = typeof patientToEdit.doctorId === 'object' && patientToEdit.doctorId
        ? (patientToEdit.doctorId as IDoctor)._id
        : (patientToEdit.doctorId as string) || '';

      setFormData({
        name: patientToEdit.name,
        age: patientToEdit.age,
        gender: patientToEdit.gender,
        phone: patientToEdit.phone,
        email: patientToEdit.email || '',
        condition: patientToEdit.condition,
        doctorId: docId,
        admissionDate: patientToEdit.admissionDate
          ? new Date(patientToEdit.admissionDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        diagnosisNotes: patientToEdit.diagnosisNotes || '',
      });
    } else {
      setEditingPatient(null);
      setFormData({
        name: '',
        age: 35,
        gender: 'Male',
        phone: '',
        email: '',
        condition: 'Stable',
        doctorId: doctorsList[0]?._id || '',
        admissionDate: new Date().toISOString().split('T')[0],
        diagnosisNotes: '',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.doctorId) {
      setFormError('Please fill in all required fields (Name, Phone, Assigned Doctor).');
      return;
    }
    savePatientMutation.mutate();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCondition('All');
    setSelectedDoctorId('All');
    setSelectedGender('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Global Patient Registry"
        description="Comprehensive clinical patient database, condition monitoring, and doctor assignments"
      />

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Patient Cohort</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              {meta?.total ?? patients.length} Enrolled
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-criteria filtering by medical condition, date range, and physician
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Patient</span>
        </button>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900">
                  {c === 'All' ? 'Condition: All' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Doctor Filter */}
          <div>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All" className="bg-white dark:bg-slate-900">Physician: All Doctors</option>
              {doctorsList.map((doc) => (
                <option key={doc._id} value={doc._id} className="bg-white dark:bg-slate-900">
                  {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g} className="bg-white dark:bg-slate-900">
                  {g === 'All' ? 'Gender: All' : g}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-1/2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
              title="Admission Start Date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-1/2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
              title="Admission End Date"
            />
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {(debouncedSearch || selectedCondition !== 'All' || selectedDoctorId !== 'All' || selectedGender !== 'All' || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter Parameters</span>
            </button>
          </div>
        )}
      </div>

      {/* Patient Table */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Patients Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              No patient records matched your active query filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Clinical Condition</th>
                  <th className="py-3.5 px-4">Assigned Doctor</th>
                  <th className="py-3.5 px-4">Admission Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {patients.map((patient: IPatient) => {
                  const doc = patient.doctorId;

                  return (
                    <tr key={patient._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-5">
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
                        {patient.email && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">{patient.email}</div>
                        )}
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
                      <td className="py-3.5 px-4">
                        {doc && typeof doc === 'object' ? (
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span className="font-medium">{doc.name}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {formatDate(patient.admissionDate || patient.createdAt)}
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenModal(patient)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Edit patient"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletePatientId(patient._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                          title="Delete patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {meta && meta.totalPage > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing Page <span className="font-bold text-slate-900 dark:text-white">{meta.page}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{meta.totalPage}</span> ({meta.total} registered patients)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 px-2">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPage))}
                disabled={page >= meta.totalPage}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingPatient ? 'Edit Patient Record' : 'Enroll New Patient'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Enter clinical and demographic details for the patient registry.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    min="0"
                    max="130"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as TPatientGender })}
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-0100"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as TPatientCondition })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Stable">Stable</option>
                    <option value="Critical">Critical</option>
                    <option value="Recovering">Recovering</option>
                    <option value="Under Observation">Under Observation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Physician *</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Doctor</option>
                    {doctorsList.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} ({doc.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Diagnosis Notes</label>
                <textarea
                  rows={2}
                  value={formData.diagnosisNotes}
                  onChange={(e) => setFormData({ ...formData, diagnosisNotes: e.target.value })}
                  placeholder="Clinical notes, symptom observations..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savePatientMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {savePatientMutation.isPending ? 'Saving...' : editingPatient ? 'Save Changes' : 'Enroll Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePatientId && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-sm w-full p-6 border border-rose-500/30 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Patient Record?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              This action will remove the patient record from the registry and update the doctor&apos;s caseload count.
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
                {deletePatientMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
