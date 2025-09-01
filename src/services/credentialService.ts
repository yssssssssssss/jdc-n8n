import { api } from '../lib/api';

export enum CredentialType {
  DATABASE = 'database',
  API = 'api',
  EMAIL = 'email',
  FTP = 'ftp',
  SSH = 'ssh',
  WEBHOOK = 'webhook',
  OAUTH = 'oauth',
  CUSTOM = 'custom',
}

export interface Credential {
  id: number;
  name: string;
  type: CredentialType;
  description?: string;
  config?: Record<string, any>;
  encryptedData?: Record<string, any>;
  isActive: boolean;
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed' | 'pending';
  testMessage?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CreateCredentialDto {
  name: string;
  type: CredentialType;
  description?: string;
  config?: Record<string, any>;
  encryptedData?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateCredentialDto {
  name?: string;
  type?: CredentialType;
  description?: string;
  config?: Record<string, any>;
  encryptedData?: Record<string, any>;
  isActive?: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

export class CredentialService {
  private static readonly BASE_URL = '/credentials';

  static async getAll(): Promise<Credential[]> {
    const response = await api.get(this.BASE_URL);
    return response.data;
  }

  static async getById(id: number): Promise<Credential> {
    const response = await api.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async getByIdWithDecryptedData(id: number): Promise<Credential & { decryptedData: string }> {
    const response = await api.get(`${this.BASE_URL}/${id}/decrypt`);
    return response.data;
  }

  static async create(data: CreateCredentialDto): Promise<Credential> {
    const response = await api.post(this.BASE_URL, data);
    return response.data;
  }

  static async update(id: number, data: UpdateCredentialDto): Promise<Credential> {
    const response = await api.patch(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`${this.BASE_URL}/${id}`);
  }

  static async testConnection(id: number): Promise<TestConnectionResult> {
    const response = await api.post(`${this.BASE_URL}/${id}/test`);
    return response.data;
  }
}