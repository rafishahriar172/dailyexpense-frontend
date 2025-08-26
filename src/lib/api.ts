/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from "axios";
import { getAccessToken } from "./token";
import { config } from "process";

export const api = axios.create({
  baseURL: process.env.NEXTAUTH_URL,
  withCredentials: true,
});

// Dynamically inject token for every request
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;   
  }
  
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle responses
api.interceptors.response.use(
  (response:AxiosResponse) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    if (!error.response) {
      console.error('Network error');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    const status = error.response.status;
    
    switch (status) {
      case 401:
        console.error('Unauthorized access');       
        break;
      case 403:
        console.error('Forbidden');
        return Promise.reject(new Error('You do not have permission to access this resource.'));
      case 404:
        console.error('Resource not found');
        return Promise.reject(new Error('The requested resource was not found.'));
      case 500:
        console.error('Server error');
        return Promise.reject(new Error('Server error. Please try again later.'));
      default:
        console.error('Unexpected error', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

const apiRequest = async <T>(request: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: (config?: any) => apiRequest(api.get('/api/transactions/getAll', config)),
  getStatistics: (config?: any) => apiRequest(api.get('/api/transactions/getStatistics', config)),
  getById: (id: string, config?: any) => apiRequest(api.get(`/api/transactions/getById/${id}`, config)),
  create: (data: any, config?: any) => apiRequest(api.post('/api/transactions/create', data, config)),
  update: (id: string, data: any, config?: any) => apiRequest(api.put(`/api/transactions/update/${id}`, data, config)),
  delete: (id: string, config?: any) => apiRequest(api.delete(`/api/transactions/delete/${id}`, config)),
  createTransfer: (data: any, config?: any) => apiRequest(api.post('/api/transactions/transfer', data, config)),
};

// Accounts API
export const accountsAPI = {
  getAll: (config?: any) => apiRequest(api.get('/api/accounts/all', config)),
  getSummary: (config?: any) => apiRequest(api.get('/api/accounts/summary', config)),
  getById: (id: string, config?: any) => apiRequest(api.get(`/api/accounts/getById/${id}`, config)),

  create: (data: any, config?: any) => apiRequest(api.post('/api/accounts/create', data, config)),
  update: (id: string, data: any, config?: any) => apiRequest(api.patch(`/api/accounts/update/${id}`, data, config)),
  delete: (id: string, config?: any) => apiRequest(api.delete(`/api/accounts/delete/${id}`, config)),
};

// Budgets API
export const budgetsAPI = {
  getAll: (config?: any) => apiRequest(api.get('/api/budgets/all', config)),
  getSummary: (config?: any) => apiRequest(api.get('/api/budgets/summary', config)),
  getAlerts: (config?: any) => apiRequest(api.get('/api/budgets/alerts', config)),
  getById: (id: string, config?: any) => apiRequest(api.get(`/api/budgets/getById/${id}`, config)),
  create: (data: any, config?: any) => apiRequest(api.post('/api/budgets/create', data, config)),
  update: (id: string, data: any, config?: any) => apiRequest(api.patch(`/api/budgets/update/${id}`, data, config)),
  delete: (id: string, config?: any) => apiRequest(api.delete(`/api/budgets/delete/${id}`, config)),
};


