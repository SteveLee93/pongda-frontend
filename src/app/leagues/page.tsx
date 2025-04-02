'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';  // 추가

type League = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdBy: {
    nickname: string;
  };
};

export default function LeagueListPage() {
  const { data: leagues, isLoading, error } = useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const res = await api.get('/leagues');
      return res.data;
    },
  });
  
  if (isLoading) return <p className="text-center mt-10">로딩 중...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">리그 불러오기 실패</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold mb-4">리그 목록</h1>
      {leagues?.map((league) => (
        <Link href={`/leagues/${league.id}`} key={league.id}>
          <div className="border p-4 rounded-lg shadow-sm hover:bg-gray-50">
            <h2 className="text-lg font-semibold">{league.name}</h2>
            <p className="text-sm text-gray-600">{league.description}</p>
            <p className="text-sm mt-1">
              기간: {league.startDate} ~ {league.endDate}
            </p>
            <p className="text-xs text-gray-500">생성자: {league.createdBy.nickname}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
