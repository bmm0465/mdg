'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Play, Loader2 } from 'lucide-react';

interface StoryAudioPlayerProps {
  storyText: string;
  storyTitle?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  token?: string;
}

export default function StoryAudioPlayer({
  storyText,
  voice = 'nova',
  speed = 1.0,
  token
}: StoryAudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 컴포넌트 언마운트 시 오디오 URL 정리
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // 오디오 재생 상태 변경 리스너
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError('오디오 재생 중 오류가 발생했습니다.');
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const generateAudio = async () => {
    if (!token) {
      setError('인증 토큰이 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: storyText,
          voice: voice,
          speed: speed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS 생성에 실패했습니다.');
      }

      // 오디오 데이터를 Blob으로 변환
      const audioBlob = await response.blob();
      
      // 이전 URL이 있으면 해제
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      // 새로운 오디오 URL 생성
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);

      // 오디오 자동 재생
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.play();
      }
    } catch (err) {
      console.error('TTS 생성 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '오디오 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleButtonClick = () => {
    if (audioUrl) {
      togglePlayPause();
    } else {
      generateAudio();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleButtonClick}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title={audioUrl ? (isPlaying ? '일시정지' : '재생') : '오디오 생성 및 재생'}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>생성 중...</span>
            </>
          ) : audioUrl ? (
            isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>재생</span>
              </>
            )
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>스토리 듣기</span>
            </>
          )}
        </button>

        {audioUrl && (
          <button
            onClick={generateAudio}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            title="오디오 새로고침"
          >
            🔄 새로고침
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* 숨겨진 오디오 엘리먼트 */}
      <audio ref={audioRef} className="hidden" />

      {/* 추가 정보 */}
      {audioUrl && (
        <div className="text-xs text-gray-500">
          음성: {voice === 'nova' ? 'Nova (여성)' : voice === 'shimmer' ? 'Shimmer (여성)' : voice.charAt(0).toUpperCase() + voice.slice(1)} | 
          속도: {speed}x
        </div>
      )}
    </div>
  );
}

