'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function MatchCreatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const leagueId = Number(params.get('leagueId'));

  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [sets, setSets] = useState([{ setNumber: 1, scorePlayer1: 0, scorePlayer2: 0 }]);

  // 참가자 불러오기
  const { data: users } = useQuery({
    queryKey: ['leagueUsers', leagueId],
    queryFn: async () => {
      const res = await api.get(`/leagues/${leagueId}/users`);
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/matches', {
        leagueId,
        player1Id,
        player2Id,
        sets,
      });
      return res.data;
    },
    onSuccess: (data) => {
      alert('경기 등록 완료!');
      router.push(`/matches/${data.id}`);
    },
    onError: () => {
      alert('등록 실패');
    },
  });

  const handleSetChange = (index: number, field: 'scorePlayer1' | 'scorePlayer2', value: number) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { setNumber: sets.length + 1, scorePlayer1: 0, scorePlayer2: 0 }]);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">경기 생성</h1>

      <select onChange={(e) => setPlayer1Id(Number(e.target.value))} className="w-full border rounded p-2">
        <option>선수 1 선택</option>
        {users?.map((u: any) => (
          <option key={u.id} value={u.id}>{u.nickname}</option>
        ))}
      </select>

      <select onChange={(e) => setPlayer2Id(Number(e.target.value))} className="w-full border rounded p-2">
        <option>선수 2 선택</option>
        {users?.map((u: any) => (
          <option key={u.id} value={u.id}>{u.nickname}</option>
        ))}
      </select>

      {sets.map((set, index) => (
        <div key={index} className="flex gap-2 items-center">
          <span className="text-sm">세트 {set.setNumber}</span>
          <input
            type="number"
            value={set.scorePlayer1}
            onChange={(e) => handleSetChange(index, 'scorePlayer1', Number(e.target.value))}
            className="w-20 border rounded p-1"
            placeholder="Player1 점수"
          />
          <input
            type="number"
            value={set.scorePlayer2}
            onChange={(e) => handleSetChange(index, 'scorePlayer2', Number(e.target.value))}
            className="w-20 border rounded p-1"
            placeholder="Player2 점수"
          />
        </div>
      ))}

      <button
        onClick={addSet}
        className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
      >
        세트 추가
      </button>

      <button
        onClick={() => mutation.mutate()}
        className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        경기 등록
      </button>
    </div>
  );
}
