'use client';

import { useState } from 'react';
import { GeneratedData } from '@/types';

interface GeneratedContentProps {
  data: GeneratedData;
}

export default function GeneratedContent({ data }: GeneratedContentProps) {
  const [activeTab, setActiveTab] = useState('story');

  const tabs = [
    { id: 'story', label: 'Short Story', icon: '📖' },
    { id: 'script', label: 'Teacher Script', icon: '👩‍🏫' },
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
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              📖 {data.short_story.title}
            </h4>
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
