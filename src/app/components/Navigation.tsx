'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
      {/* 로고 */}
      <Link href="/" className="text-xl font-bold text-blue-500">
        퐁당
      </Link>

      {/* 메인 메뉴 */}
      <div className="flex space-x-8">
        <Link 
          href="/leagues" 
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          리그전
        </Link>
        <Link 
          href="/tournaments" 
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          대회
        </Link>
        <Link 
          href="/venues" 
          className="text-gray-600 hover:text-blue-500 transition-colors"
        >
          탁구장
        </Link>
      </div>

      {/* 사용자 메뉴 */}
      <div className="flex items-center space-x-6">
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-6">
            <Link 
              href="/me" 
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              {user.nickname}님
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-6">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              로그인
            </Link>
            <Link 
              href="/signup" 
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
} 