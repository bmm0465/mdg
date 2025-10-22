import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // FormData에서 오디오 파일 추출
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: '오디오 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '오디오 파일이 너무 큽니다. 최대 25MB까지 지원됩니다.' },
        { status: 400 }
      );
    }

    console.log('Transcription started:', {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type
    });

    try {
      // OpenAI Whisper API 호출
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en", // 영어로 제한
        response_format: "verbose_json", // 상세한 응답 형식
        timestamp_granularities: ["word"], // 단어별 타임스탬프
      });

      console.log('Transcription successful:', {
        text: transcription.text.substring(0, 100) + '...',
        duration: transcription.duration,
        language: transcription.language
      });

      // 응답 데이터 구성
      const result = {
        text: transcription.text,
        confidence: 0.95, // Whisper는 직접적인 confidence를 제공하지 않으므로 추정값 사용
        words: transcription.words?.map(word => ({
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: 0.9 // 단어별 신뢰도 추정값
        })) || [],
        duration: transcription.duration,
        language: transcription.language
      };

      return NextResponse.json({
        success: true,
        data: result
      });

    } catch (whisperError) {
      console.error('OpenAI Whisper API 오류:', whisperError);
      
      const errorMessage = whisperError instanceof Error ? whisperError.message : 'Unknown error';
      
      return NextResponse.json(
        { 
          success: false, 
          error: '음성 전사 중 오류가 발생했습니다.',
          details: errorMessage 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Transcription error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: '음성 전사 중 오류가 발생했습니다.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
