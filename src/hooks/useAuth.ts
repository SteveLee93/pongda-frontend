import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { removeToken, getToken } from '@/lib/token';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const token = getToken();
        if (!token) return null;
        
        const res = await api.get('/users/me');
        return res.data;
      } catch (error: any) {
        console.error('사용자 정보 조회 에러:', error);
        if (error?.response?.status === 404) {
          // 토큰이 유효하지 않은 경우
          removeToken();
          queryClient.clear();
          router.push('/login');
        }
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
    enabled: isClient && !!getToken()
  });

  const login = async (email: string, password: string) => {
    try {
      // 1. 기존 토큰 제거
      removeToken();
      
      // 2. 로그인 API 호출
      const res = await api.post('/auth/login', { email, password });
      console.log('로그인 응답:', res.data);
      
      // 3. access_token을 token으로 저장
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        
        // 4. API 인스턴스 헤더 업데이트
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        
        // 5. 사용자 정보 갱신
        await queryClient.invalidateQueries({ queryKey: ['user'] });
        
        // 6. 홈으로 이동
        router.push('/');
        return res.data;
      } else {
        throw new Error('토큰이 없습니다.');
      }
    } catch (error) {
      console.error('로그인 API 에러:', error);
      removeToken();
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      // 1. 토큰 제거
      removeToken();
      localStorage.removeItem('token');
      
      // 2. API 인스턴스 헤더 제거
      delete api.defaults.headers.common['Authorization'];
      
      // 3. 캐시 초기화
      queryClient.clear();
      
      // 4. 사용자 정보 쿼리 무효화
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // 5. 홈으로 이동
      router.push('/');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생하더라도 토큰은 제거
      removeToken();
      localStorage.removeItem('token');
      router.push('/');
    }
  }, [queryClient, router]);

  return {
    user,
    isLoading,
    isAuthenticated: isClient && !!getToken(),
    login,
    logout
  };
}
