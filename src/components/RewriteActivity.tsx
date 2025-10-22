'use client';

import { useState } from 'react';
import { CheckCircle, Edit3, BookOpen, Send } from 'lucide-react';

interface RewriteActivityProps {
  storyContent: string;
  vocabularyWords: string[];
  token?: string;
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

export default function RewriteActivity({ 
  storyContent, 
  vocabularyWords, 
  token 
}: RewriteActivityProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [vocabularyAnswers, setVocabularyAnswers] = useState<{[key: string]: string}>({});
  const [rewriteText, setRewriteText] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 어휘 빈칸 문제 생성
  const generateVocabularyQuestions = () => {
    const questions = vocabularyWords.map((word, index) => {
      // 스토리에서 해당 단어가 포함된 문장 찾기
      const sentences = storyContent.split(/[.!?]+/).filter(s => s.trim());
      const sentenceWithWord = sentences.find(s => 
        s.toLowerCase().includes(word.toLowerCase())
      ) || sentences[index % sentences.length];
      
      // 단어를 빈칸으로 교체
      const question = sentenceWithWord.replace(
        new RegExp(`\\b${word}\\b`, 'gi'), 
        '______'
      ).trim();
      
      return {
        id: `vocab_${index}`,
        word: word,
        question: question,
        answer: ''
      };
    });
    
    return questions;
  };

  const vocabularyQuestions = generateVocabularyQuestions();

  // 어휘 답안 제출
  const handleVocabularySubmit = () => {
    const allAnswered = vocabularyQuestions.every(q => 
      vocabularyAnswers[q.id] && vocabularyAnswers[q.id].trim() !== ''
    );
    
    if (!allAnswered) {
      setError('모든 빈칸을 채워주세요.');
      return;
    }
    
    setCurrentStep(2);
    setError(null);
  };

  // 다시 쓰기 평가
  const handleRewriteSubmit = async () => {
    if (!token || !rewriteText.trim()) {
      setError('다시 쓴 이야기를 입력해주세요.');
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
          question: 'Please rewrite the story in your own words.',
          studentAnswer: rewriteText,
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

  // 단계별 렌더링
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          1단계: 어휘 빈칸 채우기
        </h3>
        <p className="text-blue-700 text-sm">
          아래 문장의 빈칸에 적절한 단어를 채워주세요.
        </p>
      </div>

      <div className="space-y-4">
        {vocabularyQuestions.map((question, index) => (
          <div key={question.id} className="bg-white border rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm text-gray-600">문제 {index + 1}</span>
              <p className="text-gray-800 mt-1">{question.question}</p>
            </div>
            <input
              type="text"
              value={vocabularyAnswers[question.id] || ''}
              onChange={(e) => setVocabularyAnswers(prev => ({
                ...prev,
                [question.id]: e.target.value
              }))}
              placeholder="답을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 text-sm text-gray-500">
              정답: <span className="font-medium">{question.word}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleVocabularySubmit}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          다음 단계로
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          2단계: 이야기 다시 쓰기
        </h3>
        <p className="text-green-700 text-sm">
          원본 이야기를 참고하여 자신만의 방식으로 다시 써보세요.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">원본 이야기</h4>
        <p className="text-gray-700 text-sm leading-relaxed">{storyContent}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          다시 쓴 이야기
        </label>
        <textarea
          value={rewriteText}
          onChange={(e) => setRewriteText(e.target.value)}
          placeholder="원본 이야기를 참고하여 자신만의 방식으로 다시 써보세요..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
        />
        <div className="mt-1 text-sm text-gray-500">
          {rewriteText.length}자 입력됨
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          이전 단계
        </button>
        <button
          onClick={handleRewriteSubmit}
          disabled={!rewriteText.trim() || isEvaluating}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEvaluating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              평가 중...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              평가 받기
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderEvaluation = () => {
    if (!evaluation) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            AI 평가 결과
          </h3>
        </div>
        
        {/* 전체 점수 */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-700">전체 점수</span>
            <span className={`text-3xl font-bold ${
              evaluation.overall_score >= 80 ? 'text-green-600' :
              evaluation.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {evaluation.overall_score}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${
                evaluation.overall_score >= 80 ? 'bg-green-500' :
                evaluation.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${evaluation.overall_score}%` }}
            ></div>
          </div>
        </div>

        {/* 세부 점수 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">내용 정확성</div>
            <div className="text-2xl font-semibold text-gray-800">{evaluation.content_accuracy}/100</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">언어 사용</div>
            <div className="text-2xl font-semibold text-gray-800">{evaluation.language_usage}/100</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">완성도</div>
            <div className="text-2xl font-semibold text-gray-800">{evaluation.completeness}/100</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600">창의성</div>
            <div className="text-2xl font-semibold text-gray-800">{evaluation.question_relevance}/100</div>
          </div>
        </div>

        {/* 피드백 */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h5 className="font-medium text-gray-700 mb-2">📝 교사 피드백</h5>
            <p className="text-gray-600">{evaluation.feedback}</p>
          </div>

          {evaluation.strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-700 mb-2">✅ 강점</h5>
              <ul className="text-sm text-green-600">
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
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="font-medium text-orange-700 mb-2">🔧 개선 영역</h5>
              <ul className="text-sm text-orange-600">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-700 mb-2">💡 제안사항</h5>
              <ul className="text-sm text-blue-600">
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

        <div className="flex justify-center">
          <button
            onClick={() => {
              setCurrentStep(1);
              setVocabularyAnswers({});
              setRewriteText('');
              setEvaluation(null);
              setError(null);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">이야기 다시 쓰기 활동</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className={`px-3 py-1 rounded-full ${
            currentStep >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
          }`}>
            1단계: 어휘
          </div>
          <div className={`px-3 py-1 rounded-full ${
            currentStep >= 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            2단계: 다시 쓰기
          </div>
          <div className={`px-3 py-1 rounded-full ${
            evaluation ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
          }`}>
            평가 결과
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {evaluation ? renderEvaluation() : (
        currentStep === 1 ? renderStep1() : renderStep2()
      )}
    </div>
  );
}
