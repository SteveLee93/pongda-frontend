'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';

interface League {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  participantCount?: number;
}

const banners = [
  {
    id: 1,
    src: '/images/banner1.jpg',
    alt: '프로모션 배너 1'
  },
  {
    id: 2,
    src: '/images/banner2.jpg',
    alt: '프로모션 배너 2'
  },
  {
    id: 3,
    src: '/images/banner3.jpg',
    alt: '프로모션 배너 3'
  },
  // ... 추가 배너
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentBanner, setCurrentBanner] = useState(0);
  
  const { data: leagues } = useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const res = await api.get('/leagues');
      return res.data;
    },
  });

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 날짜 네비게이션을 위한 함수들
  const getDates = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(selectedDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Navigation />

      {/* 배너 슬라이더 */}
      <div className="relative mb-8 rounded-xl overflow-hidden h-64">
        <Image 
          src={banners[currentBanner].src}
          alt={banners[currentBanner].alt}
          fill
          className="object-cover transition-opacity duration-500"
          priority
        />
        <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 px-2 rounded">
          {currentBanner + 1} / {banners.length}
        </div>
        
        {/* 이전/다음 버튼 */}
        <button 
          onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        >
          ←
        </button>
        <button 
          onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        >
          →
        </button>
      </div>

      {/* 날짜 선택 */}
      <div className="flex justify-between items-center mb-6 overflow-x-auto">
        {getDates().map((date, index) => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`flex flex-col items-center min-w-[80px] p-3 rounded-lg ${
              date.toDateString() === selectedDate.toDateString()
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            <span className="text-sm">
              {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
            </span>
            <span className="text-lg font-bold">
              {date.getDate()}
            </span>
          </button>
        ))}
      </div>

      {/* 필터 옵션 */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <button className="px-4 py-2 bg-white rounded-full text-sm border">
          서울 ▾
        </button>
        <button className="px-4 py-2 bg-yellow-100 rounded-full text-sm border border-yellow-200">
          🌟 쉐탁
        </button>
        <button className="px-4 py-2 bg-white rounded-full text-sm border">
          마감 가리기
        </button>
        <button className="px-4 py-2 bg-white rounded-full text-sm border">
          성별 ▾
        </button>
        <button className="px-4 py-2 bg-white rounded-full text-sm border">
          레벨 ▾
        </button>
        <button className="px-4 py-2 bg-white rounded-full text-sm border">
          실내·그늘막
        </button>
      </div>

      {/* 매치 리스트 */}
      <div className="space-y-4">
        {leagues?.map((league) => (
          <Link
            key={league.id}
            href={isAuthenticated ? `/leagues/${league.id}` : `/login?redirect=/leagues/${league.id}`}
            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-bold mb-1">{league.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(league.startDate).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  남녀모두 · {league.participantCount}명 참여
                </div>
              </div>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
                마감임박!
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
