import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// 간단한 인증 체크 함수
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function POST(request: NextRequest) {
  try {
    // 인증 체크
    const token = checkAuth(request);
    if (!token) {
      return NextResponse.json(
        { detail: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { question, studentAnswer, storyContent } = body;

    // 입력 검증
    if (!question || !studentAnswer || !storyContent) {
      return NextResponse.json(
        { success: false, error: '질문, 학생 답변, 스토리 내용이 모두 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('Answer evaluation started:', {
      question: question.substring(0, 50) + '...',
      answerLength: studentAnswer.length,
      storyLength: storyContent.length
    });

    try {
      // LLM을 사용한 답변 평가
      const evaluation = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `당신은 초등학교 영어 교사입니다. 학생의 답변을 평가해주세요.

평가 기준:
1. 내용의 정확성 (스토리 내용과 일치하는가?)
2. 질문에 대한 적절성 (질문에 제대로 답했는가?)
3. 언어 사용 (초등학생 수준에 맞는 영어인가?)
4. 완성도 (완전한 문장으로 답했는가?)

다음 JSON 형식으로 응답해주세요:
{
  "overall_score": 0-100,
  "content_accuracy": 0-100,
  "question_relevance": 0-100,
  "language_usage": 0-100,
  "completeness": 0-100,
  "feedback": "구체적인 피드백 (한국어)",
  "suggestions": ["개선 제안 1", "개선 제안 2", "개선 제안 3"],
  "strengths": ["강점 1", "강점 2"],
  "areas_for_improvement": ["개선 영역 1", "개선 영역 2"]
}`
          },
          {
            role: "user",
            content: `다음 정보를 바탕으로 학생의 답변을 평가해주세요:

질문: ${question}

학생 답변: ${studentAnswer}

스토리 내용: ${storyContent}

위의 JSON 형식으로 평가 결과를 제공해주세요.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const responseText = evaluation.choices[0]?.message?.content;
      
      if (!responseText) {
        throw new Error('LLM 응답이 비어있습니다.');
      }

      console.log('LLM evaluation response received:', responseText.substring(0, 200));

      // JSON 파싱
      let evaluationResult;
      try {
        // JSON 코드 블록 제거
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }
        
        evaluationResult = JSON.parse(cleanedText);
        
        // 데이터 유효성 검증
        if (!evaluationResult.overall_score || typeof evaluationResult.overall_score !== 'number') {
          throw new Error('평가 결과 구조가 올바르지 않습니다.');
        }
        
        console.log('Answer evaluation successful:', {
          overall_score: evaluationResult.overall_score,
          content_accuracy: evaluationResult.content_accuracy
        });
        
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('응답 내용:', responseText);
        
        // JSON 파싱 실패 시 기본 평가 결과 반환
        evaluationResult = {
          overall_score: 70,
          content_accuracy: 70,
          question_relevance: 70,
          language_usage: 70,
          completeness: 70,
          feedback: "답변을 평가했습니다. 더 구체적인 피드백을 위해 다시 시도해주세요.",
          suggestions: ["더 자세한 답변을 시도해보세요", "스토리 내용을 다시 확인해보세요"],
          strengths: ["답변을 시도했습니다"],
          areas_for_improvement: ["답변의 완성도를 높여보세요"]
        };
      }

      // Supabase에 평가 결과 저장
      try {
        const { data: dbResult, error: dbError } = await supabase
          .from('evaluations')
          .insert({
            user_id: token,
            question: question,
            student_answer: studentAnswer,
            story_content: storyContent,
            overall_score: evaluationResult.overall_score,
            content_accuracy: evaluationResult.content_accuracy,
            question_relevance: evaluationResult.question_relevance,
            language_usage: evaluationResult.language_usage,
            completeness: evaluationResult.completeness,
            feedback: evaluationResult.feedback,
            suggestions: evaluationResult.suggestions,
            strengths: evaluationResult.strengths,
            areas_for_improvement: evaluationResult.areas_for_improvement,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (dbError) {
          console.error('Supabase 평가 저장 오류:', dbError);
          // DB 저장 실패해도 평가 결과는 반환
        } else {
          console.log('Supabase 평가 저장 성공:', dbResult.id);
        }
      } catch (saveError) {
        console.error('평가 데이터 저장 중 오류:', saveError);
        // 저장 실패해도 평가 결과는 반환
      }

      return NextResponse.json({
        success: true,
        data: evaluationResult
      });

    } catch (llmError) {
      console.error('LLM 평가 오류:', llmError);
      
      const errorMessage = llmError instanceof Error ? llmError.message : 'Unknown error';
      
      return NextResponse.json(
        { 
          success: false, 
          error: '답변 평가 중 오류가 발생했습니다.',
          details: errorMessage 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Evaluation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: '답변 평가 중 오류가 발생했습니다.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
