'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function MatchDetailPage() {
  const { id } = useParams();

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const res = await api.get(`/matches/${id}`);
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center mt-10">불러오는 중...</p>;
  if (error || !match) return <p className="text-center mt-10 text-red-500">경기를 찾을 수 없습니다.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">경기 상세</h1>
      <div className="text-sm text-gray-700">
        <p><strong>리그:</strong> {match.league.name}</p>
        <p><strong>플레이어:</strong> {match.player1.nickname} vs {match.player2.nickname}</p>
        <p><strong>점수:</strong> {match.scorePlayer1} : {match.scorePlayer2}</p>
        <p><strong>승자:</strong> {match.winner.nickname}</p>
        <p><strong>날짜:</strong> {new Date(match.matchDate).toLocaleDateString()}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mt-4">세트별 점수</h2>
        <ul className="space-y-1 text-sm mt-2">
          {match.sets.map((set: any) => (
            <li key={set.id} className="border p-2 rounded">
              세트 {set.setNumber} — {match.player1.nickname}: {set.scorePlayer1}, {match.player2.nickname}: {set.scorePlayer2}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}