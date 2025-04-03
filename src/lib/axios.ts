import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getToken } from '@/lib/token';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 디버깅을 위한 인터셉터
api.interceptors.request.use((config) => {
  const token = getToken();
  console.log('현재 저장된 토큰:', token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('요청 헤더:', config.headers);
  } else {
    console.log('토큰이 없습니다!');
  }
  return config;
});

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    console.log('API 응답:', response.data);
    return response;
  },
  (error) => {
    console.error('API 에러:', error.response?.data || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;