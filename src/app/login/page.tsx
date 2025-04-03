'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await api.post('/auth/login', credentials);
      console.log('로그인 응답:', res.data); // 디버깅
      
      // 토큰 저장
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        console.log('토큰 저장됨:', res.data.access_token); // 디버깅
      }
      return res.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      router.push('/leagues');
    } catch (err: any) {
      setError('로그인에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          로그인
        </button>
      </form>
    </div>
  );
}