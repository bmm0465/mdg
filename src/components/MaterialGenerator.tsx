'use client';

import { useState } from 'react';
import axios from 'axios';
import GeneratedContent from './GeneratedContent';
import { GeneratedData, GenerateRequest } from '@/types';

export default function MaterialGenerator() {
  const [formData, setFormData] = useState({
    communicative_functions: '',
    grammar_forms: '',
    vocabulary: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('access_token');
      const requestData: GenerateRequest = {
        target_communicative_functions: formData.communicative_functions.split(',').map(s => s.trim()),
        target_grammar_forms: formData.grammar_forms.split(',').map(s => s.trim()),
        target_vocabulary: formData.vocabulary.split(',').map(s => s.trim())
      };
      
      const response = await axios.post('/api/generate', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.error || '자료 생성에 실패했습니다.');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExample = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/example', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setFormData({
          communicative_functions: response.data.data.target_communicative_functions.join(', '),
          grammar_forms: response.data.data.target_grammar_forms.join(', '),
          vocabulary: response.data.data.target_vocabulary.join(', ')
        });
      }
    } catch {
      setError('예시 데이터를 불러오는데 실패했습니다.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">수업 자료 생성</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목표 의사소통 기능
          </label>
          <input
            type="text"
            name="communicative_functions"
            value={formData.communicative_functions}
            onChange={handleChange}
            placeholder="예: 능력 묻고 답하기, 감정 묻고 답하기"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목표 문법 형태
          </label>
          <input
            type="text"
            name="grammar_forms"
            value={formData.grammar_forms}
            onChange={handleChange}
            placeholder="예: I can..., Can you...?, Yes, I can. / No, I can't."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목표 어휘
          </label>
          <input
            type="text"
            name="vocabulary"
            value={formData.vocabulary}
            onChange={handleChange}
            placeholder="예: bird, fish, frog, fly, swim, jump"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleExample}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            예시 데이터 불러오기
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? '생성 중...' : '자료 생성하기'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {result && <GeneratedContent data={result} />}
    </div>
  );
}
