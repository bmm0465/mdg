'use client';

import { User } from '@/types';

interface UserInfoProps {
  user: User | null;
  onLogout: () => void;
}

export default function UserInfo({ user, onLogout }: UserInfoProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-sm text-gray-600">안녕하세요,</div>
        <div className="font-semibold text-gray-800">{user?.name || '사용자'}</div>
        {user?.school && (
          <div className="text-xs text-gray-500">({user.school})</div>
        )}
      </div>
      <button
        onClick={onLogout}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
      >
        로그아웃
      </button>
    </div>
  );
}
