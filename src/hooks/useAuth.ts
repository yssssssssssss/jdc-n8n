import { useAuthStore } from '../store';
import { AuthService } from '../services';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await AuthService.logout();
      clearUser();
      toast.success('已成功退出登录');
      navigate('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      toast.error('退出登录失败');
      // 即使API调用失败，也清除本地状态
      clearUser();
      navigate('/login');
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    logout,
    setUser,
    clearUser,
  };
};