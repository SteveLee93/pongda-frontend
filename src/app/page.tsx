'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface League {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  participantCount?: number;
}

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  
  const { data: leagues, isLoading } = useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const res = await api.get('/leagues');
      return res.data;
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">탁구 리그</h1>
        <div className="space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.nickname}님 환영합니다
              </span>
              <Link href="/me" className="btn-primary">
                내 정보
              </Link>
              <button 
                onClick={logout}
                className="btn-secondary"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link href="/login" className="btn-primary">
                로그인
              </Link>
              <Link href="/signup" className="btn-secondary">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">진행 중인 리그</h2>
        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : leagues?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leagues.map((league) => (
              <Link 
                key={league.id} 
                href={`/leagues/${league.id}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{league.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      league.status === 'IN_PROGRESS' 
                        ? 'bg-green-100 text-green-800'
                        : league.status === 'UPCOMING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {league.status === 'IN_PROGRESS' ? '진행중' 
                        : league.status === 'UPCOMING' ? '예정' 
                        : '완료'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{league.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>기간: {new Date(league.startDate).toLocaleDateString()} ~ {new Date(league.endDate).toLocaleDateString()}</p>
                    {league.participantCount && (
                      <p>참가자: {league.participantCount}명</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">진행 중인 리그가 없습니다.</p>
        )}
      </section>
    </div>
  );
}
