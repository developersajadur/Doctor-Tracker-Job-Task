import api from '../lib/api';
import { IApiResponse, IDoctor, IPatient } from '../types';

export interface IDoctorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export const DoctorService = {
  getAllDoctors: async (params?: IDoctorQueryParams) => {
    const response = await api.get<IApiResponse<IDoctor[]>>('/doctors', {
      params,
    });
    return response.data;
  },

  getDoctorById: async (id: string) => {
    const response = await api.get<IApiResponse<IDoctor>>(`/doctors/${id}`);
    return response.data;
  },

  createDoctor: async (data: Omit<IDoctor, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<IApiResponse<IDoctor>>('/doctors', data);
    return response.data;
  },

  updateDoctor: async (id: string, data: Partial<IDoctor>) => {
    const response = await api.put<IApiResponse<IDoctor>>(`/doctors/${id}`, data);
    return response.data;
  },

  deleteDoctor: async (id: string) => {
    const response = await api.delete<IApiResponse<IDoctor>>(`/doctors/${id}`);
    return response.data;
  },

  getDoctorPatients: async (doctorId: string, params?: Record<string, unknown>) => {
    const response = await api.get<IApiResponse<{ doctor: IDoctor; result: IPatient[] }>>(
      `/doctors/${doctorId}/patients`,
      { params },
    );
    return response.data;
  },

  addPatientToDoctor: async (
    doctorId: string,
    data: Omit<IPatient, '_id' | 'doctorId' | 'createdAt' | 'updatedAt'>,
  ) => {
    const response = await api.post<IApiResponse<IPatient>>(
      `/doctors/${doctorId}/patients`,
      data,
    );
    return response.data;
  },

  deletePatientFromDoctor: async (doctorId: string, patientId: string) => {
    const response = await api.delete<IApiResponse<IPatient>>(
      `/doctors/${doctorId}/patients/${patientId}`,
    );
    return response.data;
  },
};
