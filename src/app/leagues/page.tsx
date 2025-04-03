'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: 16,
    city: '',
    district: ''
  });

  // 리그 목록 조회
  const { data: leagues, isLoading, error } = useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      try {
        const res = await api.get('/leagues');
        return res.data;
      } catch (error: any) {
        // 인증 에러인 경우 로그인 페이지로 리다이렉션
        if (error?.response?.status === 401) {
          router.push('/login?redirect=/leagues');
        }
        throw error;
      }
    },
  });

  // 리그 생성 버튼 클릭 시 로그인 체크
  const handleCreateClick = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/leagues');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=/leagues');
      return;
    }

    try {
      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      await api.post('/leagues', formattedData);
      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['leagues'] });
    } catch (error) {
      console.error('리그 생성 실패:', error);
      alert('리그 생성에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <p className="text-center mt-10">로딩 중...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <p className="text-center mt-10 text-red-500">리그 불러오기 실패</p>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Navigation />
      
      {/* 리그 목록 헤더 */}
      <div className="flex justify-between items-center my-8">
        <h1 className="text-2xl font-bold text-gray-900">리그 목록</h1>
        <button
          onClick={handleCreateClick}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          리그 만들기
        </button>
      </div>

      {/* 리그 목록 */}
      <div className="space-y-4">
        {leagues?.map((league) => (
          <Link href={`/leagues/${league.id}`} key={league.id}>
            <div className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{league.name}</h2>
                  <p className="text-gray-600 mt-2">{league.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-sm text-gray-500">
                      {new Date(league.startDate).toLocaleDateString()} ~ {new Date(league.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">생성자: {league.createdBy.nickname}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 리그 생성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">새 리그 만들기</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">리그 이름 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="리그 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="리그에 대한 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시작일 *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        startDate,
                        endDate: prev.endDate && startDate > prev.endDate ? startDate : prev.endDate
                      }));
                    }}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">종료일 *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">최대 참가 인원</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시/도</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 인천시"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">구/군</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 부평구"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
