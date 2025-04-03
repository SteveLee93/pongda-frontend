import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        
        const res = await api.get('/users/me');
        return res.data;
      } catch (error) {
        console.error('사용자 정보 조회 에러:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
  });

  const login = async (email: string, password: string) => {
    try {
      console.log('로그인 API 호출:', { email });
      const res = await api.post('/auth/login', { email, password });
      console.log('로그인 API 응답:', res.data);
      
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        await queryClient.invalidateQueries({ queryKey: ['user'] });
        router.push('/');
        return res.data;
      } else {
        throw new Error('토큰이 없습니다.');
      }
    } catch (error) {
      console.error('로그인 API 에러:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    queryClient.setQueryData(['user'], null);
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
