'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📚 영어 수업 자료 생성
          </h1>
          <p className="text-gray-600">
            AI 기반 초등학교 영어 수업 자료 자동 생성 시스템
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-400">
          <h3 className="font-semibold text-blue-800 mb-2">🚀 데모 계정으로 바로 시작하세요!</h3>
          <p className="text-sm text-blue-700">
            <strong>이메일:</strong> demo@example.com<br />
            <strong>비밀번호:</strong> demo123
          </p>
        </div>

        <LoginForm onLogin={() => {
          router.push('/dashboard');
        }} />
      </div>
    </div>
  );
}