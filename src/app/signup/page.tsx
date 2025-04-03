'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface CreateUserDto {
  email: string;
  nickname: string;
  password: string;
  role: 'player' | 'manager';
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'player' | 'manager'>('player');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(''); // 이메일 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailError('');

    try {
      const userData: CreateUserDto = {
        email,
        nickname,
        password,
        role,
      };

      console.log('회원가입 요청:', userData);
      
      await api.post('/users', userData);
      
      console.log('회원가입 응답:', userData);
      toast.success('회원가입이 완료되었습니다! 로그인해주세요.');
      router.push('/');
    } catch (err: any) {
      console.error('회원가입 에러:', err.response?.data);
      
      if (err.response?.status === 409) {
        setEmailError('이미 사용 중인 이메일입니다.');
        toast.error('이미 사용 중인 이메일입니다.');
      } else {
        const errorMessage = err.response?.data?.message;
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg: string) => toast.error(msg));
        } else {
          toast.error(errorMessage || '회원가입에 실패했습니다.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full p-2 border rounded ${
              emailError ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            required
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
            required
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">비밀번호는 최소 6자 이상이어야 합니다.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">역할</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'player' | 'manager')}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          >
            <option value="player">플레이어</option>
            <option value="manager">관장</option>
          </select>
        </div>
        <button 
          type="submit" 
          className={`w-full btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '회원가입'}
        </button>
        <p className="text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
