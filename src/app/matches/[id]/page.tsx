'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useState } from 'react';

type Memo = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  match: {
    id: number;
    scorePlayer1: number;
    scorePlayer2: number;
    matchDate: string;
  };
};

export default function MatchDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [memoContent, setMemoContent] = useState('');

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const res = await api.get(`/matches/${id}`);
      return res.data;
    },
  });

  const { data: myMemos, isLoading: isMemoLoading, error: memoError } = useQuery<Memo>({
    queryKey: ['memo', id],
    queryFn: async () => {
      console.log('메모 API 호출 시도');
      console.log('현재 ID:', id, typeof id);
      
      try {
        const res = await api.get(`/matches/${id}/memo`);
        console.log('메모 API 응답:', res.data);
        return res.data;
      } catch (error) {
        console.error('메모 API 에러:', error);
        throw error;
      }
    },
    enabled: true,
    retry: false
  });

  console.log('Query 상태:', {
    id,
    isLoading: isMemoLoading,
    error: memoError,
    data: myMemos
  });

  if (memoError) {
    console.error('메모 요청 에러:', memoError);
  }

  console.log('현재 match ID:', id);

  const memoMutation = useMutation({
    mutationFn: async () => {
      if (!memoContent.trim()) {
        throw new Error('메모 내용을 입력해주세요');
      }
      const res = await api.post(`/matches/${id}/memo`, { content: memoContent });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memo', id] });
      setMemoContent('');
      alert('메모가 저장되었습니다!');
    },
    onError: (error: any) => {
      alert(error.message || '메모 저장에 실패했습니다');
    },
  });

  if (isLoading) return <p className="text-center mt-10">불러오는 중...</p>;
  if (error || !match) return <p className="text-center mt-10 text-red-500">경기를 찾을 수 없습니다.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <div className="space-y-4">
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

      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">📝 내 메모</h2>
        {isMemoLoading ? (
          <p className="text-sm text-gray-500">메모를 불러오는 중...</p>
        ) : myMemos ? (
          <p className="text-sm text-gray-800 whitespace-pre-line">
            {myMemos.content}
          </p>
        ) : (
          <p className="text-sm text-gray-500">작성한 메모가 없습니다.</p>
        )}

        <textarea
          value={memoContent}
          onChange={(e) => setMemoContent(e.target.value)}
          className="w-full border p-2 mt-3 rounded text-sm"
          rows={4}
          placeholder="경기 후기를 메모로 남겨보세요"
        />
        <button
          onClick={() => memoMutation.mutate()}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          메모 저장
        </button>
      </div>
    </div>
  );
}
