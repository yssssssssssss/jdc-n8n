import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除认证状态
      useAuthStore.getState().logout();
      // 可以在这里添加重定向到登录页面的逻辑
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API响应类型
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// API错误类型
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// 通用API请求方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config).then((response) => response.data);
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then((response) => response.data);
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then((response) => response.data);
  },

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then((response) => response.data);
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then((response) => response.data);
  },
};

export default api