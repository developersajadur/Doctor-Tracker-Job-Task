import api from '../lib/api';
import { IApiResponse, IPatient } from '../types';

export interface IPatientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  gender?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export const PatientService = {
  getAllPatients: async (params?: IPatientQueryParams) => {
    const response = await api.get<IApiResponse<IPatient[]>>('/patients', {
      params,
    });
    return response.data;
  },

  getPatientById: async (id: string) => {
    const response = await api.get<IApiResponse<IPatient>>(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (
    data: Omit<IPatient, '_id' | 'createdAt' | 'updatedAt'>,
  ) => {
    const response = await api.post<IApiResponse<IPatient>>('/patients', data);
    return response.data;
  },

  updatePatient: async (id: string, data: Partial<IPatient>) => {
    const response = await api.put<IApiResponse<IPatient>>(
      `/patients/${id}`,
      data,
    );
    return response.data;
  },

  deletePatient: async (id: string) => {
    const response = await api.delete<IApiResponse<IPatient>>(`/patients/${id}`);
    return response.data;
  },
};
