'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

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
type User = {
    id: number;
    nickname: string;
    email: string;
    role: 'player' | 'manager';
};
type Match = {
    id: number;
    league: { id: number; name: string };
    player1: { nickname: string };
    player2: { nickname: string };
    scorePlayer1: number;
    scorePlayer2: number;
    winner: { nickname: string };
    matchDate: string;
};



export default function LeagueDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: league, isLoading, error } = useQuery<League>({
        queryKey: ['league', id],
        queryFn: async () => {
            const res = await api.get(`/leagues/${id}`);
            return res.data;
        },
    });
    const { data: me } = useQuery<User | null>({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/users/me');
            return res.data;
        },
    });
    const { data: participants, isLoading: isLoadingUsers } = useQuery<User[]>({
        queryKey: ['leagueUsers', id],
        queryFn: async () => {
            const res = await api.get(`/leagues/${id}/users`);
            return res.data;
        },
    });
    const isAlreadyJoined = useMemo(() => {
        if (!me || !participants) return false;
        return participants.some((p) => p.id === me.id);
    }, [me, participants]);
    const joinMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/leagues/${id}/join`);
        },
        onSuccess: () => {
            alert('리그에 참가했습니다!');
            queryClient.invalidateQueries({ queryKey: ['league', id] });
            router.refresh();
        },
        onError: () => {
            alert('이미 참가했거나 오류가 발생했습니다.');
        },
    });
    const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
        queryKey: ['matches'],
        queryFn: async () => {
            const res = await api.get('/matches');
            return res.data;
        },
    });

    const leagueMatches = useMemo(
        () => matches?.filter((m) => m.league.id === id) ?? [],
        [matches, id]
    );
    const canCreateMatch = useMemo(() => {
        if (!me || !participants || !league) return false;
        const isParticipant = participants.some((p) => p.id === me.id);
        const isManager = league.createdBy.nickname === me.nickname;
        return isParticipant || isManager;
      }, [me, participants, league]);
    if (isLoading) return <p className="text-center mt-10">로딩 중...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">리그 정보를 불러오지 못했습니다.</p>;

    return (
        <div className="max-w-2xl mx-auto mt-10 space-y-4">
            <h1 className="text-2xl font-bold">{league?.name}</h1>
            <p className="text-gray-600">{league?.description}</p>
            <p className="text-sm">
                기간: {league?.startDate} ~ {league?.endDate}
            </p>
            <p className="text-xs text-gray-500">생성자: {league?.createdBy.nickname}</p>
            <button
                onClick={() => joinMutation.mutate()}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                리그 참가하기
            </button>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">참가자 목록</h3>
                {isLoadingUsers ? (
                    <p>참가자 로딩 중...</p>
                ) : participants && participants.length > 0 ? (
                    <ul className="space-y-1">
                        {participants.map((user) => (
                            <li key={user.id} className="text-sm text-gray-700">
                                • {user.nickname} ({user.role === 'manager' ? '관장' : '플레이어'})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">아직 참가한 사람이 없습니다.</p>
                )}
            </div>
            {me && !isAlreadyJoined && (
                <button
                    onClick={() => joinMutation.mutate()}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    리그 참가하기
                </button>
            )}
            <div className="mt-10">
                <h3 className="text-lg font-semibold mb-2">경기 목록</h3>
                {isLoadingMatches ? (
                    <p>경기 로딩 중...</p>
                ) : leagueMatches.length > 0 ? (
                    <ul className="space-y-2">
                        {leagueMatches.map((match) => (
                            <li key={match.id} className="border p-3 rounded text-sm">
                                <span className="font-semibold">{match.player1.nickname}</span>
                                {' vs '}
                                <span className="font-semibold">{match.player2.nickname}</span>
                                <br />
                                점수: {match.scorePlayer1} : {match.scorePlayer2}{' '}
                                (승자: {match.winner.nickname})<br />
                                날짜: {new Date(match.matchDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">아직 등록된 경기가 없습니다.</p>
                )}
            </div>
            {canCreateMatch && (
                <button
                    onClick={() => router.push(`/matches/new?leagueId=${id}`)}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    경기 생성하기
                </button>
            )}
        </div>
    );
}
