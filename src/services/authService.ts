import { api, ApiResponse, ApiError } from '../lib/api';
import { User, useAuthStore } from '../store';

// 认证相关的数据类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// 认证服务类
export class AuthService {
  /**
   * 用户登录
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // 登录成功后更新store状态
      const { user, access_token } = response;
      useAuthStore.getState().login(user, access_token);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登录失败，请重试';
      useAuthStore.getState().setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 用户注册
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      // 注册成功后自动登录
      const { user, access_token } = response;
      useAuthStore.getState().login(user, access_token);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '注册失败，请重试';
      useAuthStore.getState().setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    try {
      // 清除本地状态
      useAuthStore.getState().logout();
      
      // 可以在这里调用后端登出接口（如果有的话）
      // await api.post('/auth/logout');
    } catch (error: any) {
      console.error('登出时发生错误:', error);
      // 即使后端登出失败，也要清除本地状态
      useAuthStore.getState().logout();
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/profile');
      
      // 更新store中的用户信息
      useAuthStore.getState().setUser(response);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '获取用户信息失败';
      useAuthStore.getState().setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 刷新token
   */
  static async refreshToken(): Promise<string> {
    try {
      const response = await api.post<{ access_token: string }>('/auth/refresh');
      
      // 更新store中的token
      useAuthStore.getState().setToken(response.access_token);
      
      return response.access_token;
    } catch (error: any) {
      // 刷新失败，清除认证状态
      useAuthStore.getState().logout();
      throw new Error('Token刷新失败，请重新登录');
    }
  }

  /**
   * 验证邮箱格式
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证密码强度
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('密码长度至少6位');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('密码必须包含小写字母');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('密码必须包含大写字母');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('密码必须包含数字');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default AuthService;