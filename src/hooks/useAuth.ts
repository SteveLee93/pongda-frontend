import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { removeToken, getToken } from '@/lib/token';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const token = getToken();
        if (!token) {
          return null;
        }
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/users/me');
        return res.data;
      } catch (error: any) {
        console.error('사용자 정보 조회 에러:', error);
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          removeToken();
          delete api.defaults.headers.common['Authorization'];
        }
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  const isAuthenticated = Boolean(getToken() && user);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        await queryClient.invalidateQueries({ queryKey: ['user'] });
        return res.data;
      } else {
        throw new Error('토큰이 없습니다.');
      }
    } catch (error) {
      console.error('로그인 API 에러:', error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      removeToken();
      delete api.defaults.headers.common['Authorization'];
      queryClient.clear();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      removeToken();
      router.push('/');
    }
  }, [queryClient, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  };
}
