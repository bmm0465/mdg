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

    const body = await request.json();
    const { text, voice = 'nova', speed = 1.0 } = body;

    // 텍스트 검증
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: '텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 텍스트 길이 제한 (OpenAI TTS는 최대 4096 자)
    if (text.length > 4096) {
      return NextResponse.json(
        { success: false, error: '텍스트가 너무 깁니다. 최대 4096자까지 지원됩니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('TTS generation started:', {
      text_length: text.length,
      voice: voice,
      speed: speed
    });

    try {
      // OpenAI TTS API 호출
      const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd", // 고품질 모델 사용
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        input: text,
        speed: speed, // 0.25 ~ 4.0 (기본값: 1.0)
      });

      // 오디오 데이터를 Buffer로 변환
      const buffer = Buffer.from(await mp3.arrayBuffer());

      console.log('TTS generation successful:', {
        buffer_size: buffer.length,
        voice: voice
      });

      // MP3 파일로 반환
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'Content-Disposition': 'inline; filename="story.mp3"',
        },
      });

    } catch (ttsError: any) {
      console.error('OpenAI TTS API 오류:', ttsError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'TTS 생성 중 오류가 발생했습니다.',
          details: ttsError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'TTS 생성 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET 요청 지원 (쿼리 파라미터로 텍스트 전달)
export async function GET(request: NextRequest) {
  try {
    // 인증 체크
    const token = checkAuth(request);
    if (!token) {
      return NextResponse.json(
        { detail: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    const voice = searchParams.get('voice') || 'nova';
    const speed = parseFloat(searchParams.get('speed') || '1.0');

    // 텍스트 검증
    if (!text) {
      return NextResponse.json(
        { success: false, error: '텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 텍스트 길이 제한
    if (text.length > 4096) {
      return NextResponse.json(
        { success: false, error: '텍스트가 너무 깁니다. 최대 4096자까지 지원됩니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('TTS generation started (GET):', {
      text_length: text.length,
      voice: voice,
      speed: speed
    });

    try {
      // OpenAI TTS API 호출
      const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd", // 고품질 모델 사용
        voice: voice as any,
        input: text,
        speed: speed,
      });

      // 오디오 데이터를 Buffer로 변환
      const buffer = Buffer.from(await mp3.arrayBuffer());

      console.log('TTS generation successful (GET):', {
        buffer_size: buffer.length,
        voice: voice
      });

      // MP3 파일로 반환
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'Content-Disposition': 'inline; filename="story.mp3"',
        },
      });

    } catch (ttsError: any) {
      console.error('OpenAI TTS API 오류 (GET):', ttsError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'TTS 생성 중 오류가 발생했습니다.',
          details: ttsError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('TTS error (GET):', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'TTS 생성 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

