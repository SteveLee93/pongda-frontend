'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['my-stats'],
    queryFn: async () => {
      const res = await api.get('/users/me/stats');
      return res.data;
    }
  });

  const { data: matches } = useQuery({
    queryKey: ['my-matches'],
    queryFn: async () => {
      const res = await api.get('/matches');
      return res.data;
    },
    enabled: !!me
  });

  const { data: memos } = useQuery({
    queryKey: ['my-memos'],
    queryFn: async () => {
      if (!matches) return [];
      
      const memoPromises = matches.map(async (match: any) => {
        try {
          const res = await api.get(`/matches/${match.id}/memo`);
          return {
            ...res.data,
            match: match
          };
        } catch (error) {
          console.log(`매치 ${match.id}의 메모를 가져오는데 실패했습니다:`, error);
          return null;
        }
      });

      const results = await Promise.all(memoPromises);
      return results.filter(memo => memo !== null);
    },
    enabled: !!matches
  });

  const updateMemo = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      await api.post(`/matches/${id}/memo`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-memos'] });
      setEditingMemoId(null);
      setEditedContent('');
    },
  });

  const deleteMemo = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/matches/${id}/memo`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-memos'] });
    },
  });

  if (isLoading || !me) return <p className="text-center mt-10">불러오는 중...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-8">
      <section>
        <h1 className="text-2xl font-bold">👤 내 정보</h1>
        <p className="text-sm">닉네임: {me.nickname}</p>
        <p className="text-sm">이메일: {me.email}</p>
        <p className="text-sm">역할: {me.role === 'manager' ? '관장' : '플레이어'}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">🏓 참가 중인 리그</h2>
        {me.leaguesJoined.length > 0 ? (
          <ul className="list-disc ml-4 text-sm">
            {me.leaguesJoined.map((l: any) => (
              <li key={l.id}>{l.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">참가한 리그가 없습니다.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">📊 내 통계</h2>
        {stats ? (
          <ul className="text-sm space-y-1">
            <li>총 경기 수: {stats.totalMatches}</li>
            <li>승: {stats.wins} / 패: {stats.losses}</li>
            <li>승률: {stats.winRate}%</li>
            <li>세트 평균 점수: {stats.avgSetScore}</li>
            <li>작성한 메모 수: {stats.totalMemos}</li>
          </ul>
        ) : (
          <p className="text-sm text-gray-500">통계 정보를 불러오는 중...</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">🎮 내 경기</h2>
        {matches && matches.length > 0 ? (
          <ul className="text-sm space-y-2">
            {matches.map((m: any) => (
              <li
                key={m.id}
                className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/matches/${m.id}`)}
              >
                {new Date(m.matchDate).toLocaleDateString()} — {m.player1.nickname} vs {m.player2.nickname} (승자: {m.winner.nickname})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">기록된 경기가 없습니다.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">📝 내가 쓴 메모</h2>
        {memos && memos.length > 0 ? (
          <ul className="text-sm space-y-4">
            {memos.map((memo: any) => (
              <li key={memo.id} className="border rounded p-3">
                {memo.match && (
                  <p className="font-semibold mb-1">
                    경기 {memo.match.id} - {memo.match.player1?.nickname || '플레이어1'} vs {memo.match.player2?.nickname || '플레이어2'}
                  </p>
                )}

                {editingMemoId === memo.match?.id ? (
                  <>
                    <textarea
                      className="w-full border p-2 rounded text-sm mb-2"
                      rows={3}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="space-x-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                        onClick={() => updateMemo.mutate({ id: memo.match.id, content: editedContent })}
                      >저장</button>
                      <button
                        className="px-3 py-1 bg-gray-300 text-sm rounded"
                        onClick={() => setEditingMemoId(null)}
                      >취소</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 whitespace-pre-line mb-2">{memo.content}</p>
                    <div className="space-x-2">
                      <button
                        className="px-3 py-1 bg-yellow-400 text-sm rounded"
                        onClick={() => {
                          setEditingMemoId(memo.match.id);
                          setEditedContent(memo.content);
                        }}
                      >수정</button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                        onClick={() => deleteMemo.mutate(memo.match.id)}
                      >삭제</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">작성한 메모가 없습니다.</p>
        )}
      </section>
    </div>
  );
}
