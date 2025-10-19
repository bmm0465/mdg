'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import MaterialGenerator from '@/components/MaterialGenerator';
import UserInfo from '@/components/UserInfo';
import { User } from '@/types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      console.log('대시보드 토큰 체크:', token);
      
      if (!token) {
        console.log('토큰 없음, 홈으로 리다이렉트');
        router.push('/');
        return;
      }

      try {
        console.log('API 호출 시도');
        const response = await axios.get<User>('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('사용자 정보 받음:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('인증 실패:', error);
        localStorage.removeItem('access_token');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🎓 영어 수업 자료 자동 생성 에이전트
              </h1>
              <p className="text-gray-600">
                초등학생용 Short Story와 Teacher&apos;s Talk Script를 쉽게 만들어보세요
              </p>
            </div>
            <UserInfo user={user} onLogout={handleLogout} />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <MaterialGenerator />
        </div>
      </div>
    </div>
  );
}
