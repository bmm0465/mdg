'use client';

import { useState } from 'react';
import { GeneratedData } from '@/types';
import StoryAudioPlayer from './StoryAudioPlayer';
import RetellingActivity from './RetellingActivity';

interface GeneratedContentProps {
  data: GeneratedData;
  token?: string;
}

export default function GeneratedContent({ data, token }: GeneratedContentProps) {
  const [activeTab, setActiveTab] = useState('story');

  const tabs = [
    { id: 'story', label: 'Short Story', icon: '📖' },
    { id: 'script', label: 'Teacher Script', icon: '👩‍🏫' },
    { id: 'retelling', label: 'Retelling Activity', icon: '🎤' },
    { id: 'rewrite', label: 'Rewrite Activities', icon: '✍️' },
    { id: 'unit', label: 'Unit Info', icon: '📚' }
  ];

  return (
    <div className="mt-8 bg-gray-50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">생성된 자료</h3>
      
      {/* 탭 메뉴 */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white rounded-lg p-6">
        {activeTab === 'story' && (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                📖 {data.short_story.title}
              </h4>
              {token && (
                <div className="ml-4">
                  <StoryAudioPlayer
                    storyText={data.short_story.content}
                    storyTitle={data.short_story.title}
                    voice="nova"
                    speed={1.0}
                    token={token}
                    showSpeedControl={true}
                  />
                </div>
              )}
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {data.short_story.content}
              </p>
            </div>
            <div className="mt-4 flex space-x-4 text-sm text-gray-500">
              <span>단어 수: {data.short_story.word_count}</span>
              <span>문장 수: {data.short_story.sentence_count}</span>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-6">
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">🎯 도입부</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.teacher_script.opening.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">📖 읽기 중</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.teacher_script.during_reading.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">❓ 읽기 후</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.teacher_script.after_reading.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">💬 핵심 표현 연습</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.teacher_script.key_expression_practice.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">🔄 리텔링 가이드</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.teacher_script.retelling_guidance.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">📊 평가 기준</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.teacher_script.evaluation_criteria.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">🎉 마무리</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.teacher_script.wrap_up.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'retelling' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              🎤 Retelling Activity
            </h4>
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-2">
                <strong>활동 설명:</strong> 교사의 질문에 답하면서 스토리를 다시 확인해보세요.
              </p>
              <p className="text-sm text-gray-600">
                마이크를 사용하여 답변을 녹음하고, AI가 자동으로 전사하여 평가해드립니다.
              </p>
            </div>
            <RetellingActivity
              questions={data.teacher_script.after_reading}
              token={token}
            />
          </div>
        )}

        {activeTab === 'rewrite' && data.rewrite_activities && (
          <div className="space-y-6">
            {/* Vocabulary Fill Activity */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">📝 1단계: 어휘 빈칸 채우기</h5>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                  {data.rewrite_activities.vocabulary_fill.modified_story}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600">단어 은행:</span>
                  {data.rewrite_activities.vocabulary_fill.word_bank.map((word, index) => (
                    <span key={index} className="px-2 py-1 bg-white rounded border text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Rewrite Activity */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">✍️ 2단계: 전체 스토리 다시 쓰기</h5>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="mb-4">
                  <h6 className="font-medium text-gray-700 mb-2">📋 스토리 구조 분석</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">📍 배경:</span> {data.rewrite_activities.full_rewrite.story_structure.setting}
                    </div>
                    <div>
                      <span className="font-medium">👥 등장인물:</span> {data.rewrite_activities.full_rewrite.story_structure.characters}
                    </div>
                    <div>
                      <span className="font-medium">⚠️ 상황:</span> {data.rewrite_activities.full_rewrite.story_structure.problem}
                    </div>
                    <div>
                      <span className="font-medium">💡 주제:</span> {data.rewrite_activities.full_rewrite.story_structure.theme}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6 className="font-medium text-gray-700 mb-2">📝 다시 쓰기 가이드</h6>
                  <div className="bg-white p-3 rounded border text-sm text-gray-700 whitespace-pre-line">
                    {data.rewrite_activities.full_rewrite.rewrite_guide}
                  </div>
                </div>

                <div>
                  <h6 className="font-medium text-gray-700 mb-2">📊 Story Grammar 루브릭 (9개 영역, 0-4점 척도)</h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {Object.entries(data.rewrite_activities.full_rewrite.story_grammar_rubric).map(([key, criteria]) => (
                      <div key={key} className="bg-white p-2 rounded border">
                        <div className="font-medium text-gray-600 mb-1 capitalize">{key}</div>
                        <ul className="space-y-1">
                          {criteria.map((criterion, index) => (
                            <li key={index} className="text-gray-600">• {criterion}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'unit' && (
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">🎯 목표 의사소통 기능</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.unit.target_communicative_functions.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">📝 목표 문법 형태</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.unit.target_grammar_forms.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">📚 목표 어휘</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.unit.target_vocabulary.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
