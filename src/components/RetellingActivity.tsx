'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Square, CheckCircle, AlertCircle } from 'lucide-react';

interface RetellingActivityProps {
  questions: string[];
  token?: string;
  storyContent?: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

interface EvaluationResult {
  overall_score: number;
  content_accuracy: number;
  question_relevance: number;
  language_usage: number;
  completeness: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  areas_for_improvement: string[];
}

export default function RetellingActivity({ questions, token, storyContent }: RetellingActivityProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null
  });
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 녹음 시간 업데이트
  useEffect(() => {
    if (recordingState.isRecording && !recordingState.isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recordingState.isRecording, recordingState.isPaused]);

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // 고품질 오디오 형식
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordingState(prev => ({
          ...prev,
          audioBlob,
          audioUrl
        }));
        stream.getTracks().forEach(track => track.stop());
        
        console.log('Recording completed:', {
          blobSize: audioBlob.size,
          blobType: audioBlob.type,
          duration: recordingState.duration
        });
        
        // 녹음 완료 시 자동으로 전사 시작
        setTimeout(() => {
          transcribeAudio(audioBlob);
        }, 1000);
      };

      mediaRecorder.start();
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0
      }));
      setError(null);
    } catch (err) {
      console.error('녹음 시작 실패:', err);
      setError('마이크 접근 권한이 필요합니다.');
    }
  };

  // 녹음 일시정지/재개
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (recordingState.isPaused) {
        mediaRecorderRef.current.resume();
        setRecordingState(prev => ({ ...prev, isPaused: false }));
      } else {
        mediaRecorderRef.current.pause();
        setRecordingState(prev => ({ ...prev, isPaused: true }));
      }
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false
      }));
    }
  };

  // 녹음 재생
  const playRecording = () => {
    if (recordingState.audioUrl) {
      const audio = new Audio(recordingState.audioUrl);
      audio.play();
    }
  };

  // 전사 요청
  const transcribeAudio = async (audioBlob?: Blob) => {
    const audioToTranscribe = audioBlob || recordingState.audioBlob;
    if (!audioToTranscribe || !token) {
      setError('녹음 파일이나 인증 토큰이 없습니다.');
      return;
    }

    // 오디오 파일 크기 체크
    if (audioToTranscribe.size < 1000) { // 1KB 미만
      setError('녹음 시간이 너무 짧습니다. 더 길게 말씀해주세요.');
      return;
    }

    console.log('Starting transcription:', {
      blobSize: audioToTranscribe.size,
      blobType: audioToTranscribe.type
    });

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioToTranscribe, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '전사에 실패했습니다.');
      }

      const result = await response.json();
      
      console.log('Transcription response:', {
        success: result.success,
        text: result.data?.text,
        textLength: result.data?.text?.length || 0
      });
      
      if (!result.success) {
        throw new Error(result.error || '전사에 실패했습니다.');
      }
      
      if (!result.data || !result.data.text || result.data.text.trim().length === 0) {
        throw new Error('음성을 인식할 수 없습니다. 더 명확하게 말씀해주세요.');
      }
      
      setTranscription(result.data);
      
      // 전사 완료 후 자동으로 평가 시작
      if (result.data.text && storyContent) {
        evaluateAnswer(result.data.text);
      }
    } catch (err) {
      console.error('전사 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '전사 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  // 답변 평가
  const evaluateAnswer = async (transcribedText: string) => {
    if (!token || !storyContent) {
      setError('평가를 위한 정보가 부족합니다.');
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: questions[currentQuestionIndex],
          studentAnswer: transcribedText,
          storyContent: storyContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '평가에 실패했습니다.');
      }

      const result = await response.json();
      setEvaluation(result.data);
    } catch (err) {
      console.error('평가 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '평가 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 다음 질문으로
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null
      });
      setTranscription(null);
      setEvaluation(null);
      setError(null);
    }
  };

  // 이전 질문으로
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null
      });
      setTranscription(null);
      setEvaluation(null);
      setError(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* 질문 표시 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800">
            질문 {currentQuestionIndex + 1} / {questions.length}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
        <p className="text-gray-700 text-lg">
          {questions[currentQuestionIndex]}
        </p>
      </div>

      {/* 녹음 컨트롤 */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          {!recordingState.isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Mic className="w-5 h-5" />
              녹음 시작
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {recordingState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {recordingState.isPaused ? '재개' : '일시정지'}
              </button>
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Square className="w-5 h-5" />
                녹음 중지
              </button>
            </>
          )}
        </div>

        {/* 녹음 상태 */}
        {recordingState.isRecording && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">
                {recordingState.isPaused ? '일시정지됨' : '녹음 중...'}
              </span>
            </div>
            <div className="text-2xl font-mono text-gray-600">
              {formatTime(recordingState.duration)}
            </div>
          </div>
        )}

        {/* 녹음 완료 후 컨트롤 */}
        {recordingState.audioUrl && !recordingState.isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={playRecording}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Play className="w-5 h-5" />
                재생
              </button>
              <button
                onClick={() => transcribeAudio()}
                disabled={isTranscribing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTranscribing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    전사 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    전사하기
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 전사 결과 */}
        {transcription && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              전사 결과
            </h5>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>인식된 텍스트:</strong> {transcription.text}
              </p>
              <p className="text-sm text-gray-600">
                <strong>신뢰도:</strong> {(transcription.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* 평가 결과 */}
        {evaluation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              AI 평가 결과
            </h5>
            
            {/* 전체 점수 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">전체 점수</span>
                <span className={`text-2xl font-bold ${
                  evaluation.overall_score >= 80 ? 'text-green-600' :
                  evaluation.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {evaluation.overall_score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    evaluation.overall_score >= 80 ? 'bg-green-500' :
                    evaluation.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${evaluation.overall_score}%` }}
                ></div>
              </div>
            </div>

            {/* 세부 점수 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">내용 정확성</div>
                <div className="text-lg font-semibold text-gray-800">{evaluation.content_accuracy}/100</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">질문 적합성</div>
                <div className="text-lg font-semibold text-gray-800">{evaluation.question_relevance}/100</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">언어 사용</div>
                <div className="text-lg font-semibold text-gray-800">{evaluation.language_usage}/100</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">완성도</div>
                <div className="text-lg font-semibold text-gray-800">{evaluation.completeness}/100</div>
              </div>
            </div>

            {/* 피드백 */}
            <div className="space-y-3">
              <div>
                <h6 className="font-medium text-gray-700 mb-1">📝 교사 피드백</h6>
                <p className="text-gray-600 text-sm">{evaluation.feedback}</p>
              </div>

              {evaluation.strengths.length > 0 && (
                <div>
                  <h6 className="font-medium text-green-700 mb-1">✅ 강점</h6>
                  <ul className="text-sm text-gray-600">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-green-500">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.areas_for_improvement.length > 0 && (
                <div>
                  <h6 className="font-medium text-orange-700 mb-1">🔧 개선 영역</h6>
                  <ul className="text-sm text-gray-600">
                    {evaluation.areas_for_improvement.map((area, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-orange-500">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.suggestions.length > 0 && (
                <div>
                  <h6 className="font-medium text-blue-700 mb-1">💡 제안사항</h6>
                  <ul className="text-sm text-gray-600">
                    {evaluation.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-500">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 평가 중 표시 */}
        {isEvaluating && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 font-medium">AI가 답변을 평가하고 있습니다...</span>
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
