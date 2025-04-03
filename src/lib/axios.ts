import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// 토큰 디버깅을 위한 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  console.log('현재 저장된 토큰:', token); // 디버깅

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('요청 헤더:', config.headers); // 디버깅
  } else {
    console.log('토큰이 없습니다!'); // 디버깅
  }
  return config;
});

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    console.log('API 응답:', response.data); // 디버깅용
    return response;
  },
  (error) => {
    console.error('API 에러:', error.response?.data || error); // 디버깅용
    return Promise.reject(error);
  }
);

export default api;