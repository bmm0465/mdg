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

      // Supabase Storage에 TTS 오디오 저장
      try {
        const timestamp = new Date().getTime();
        const fileName = `tts/story_${timestamp}_${voice}.mp3`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(fileName, buffer, {
            contentType: 'audio/mpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase Storage 업로드 오류:', uploadError);
        } else {
          console.log('Supabase Storage 업로드 성공:', uploadData.path);
          
          // 데이터베이스에 메타데이터 저장
          const { error: dbError } = await supabase
            .from('tts_files')
            .insert({
              user_id: token,
              file_path: uploadData.path,
              voice: voice,
              speed: speed,
              text_length: text.length,
              file_size: buffer.length,
              created_at: new Date().toISOString()
            });
          
          if (dbError) {
            console.error('TTS 메타데이터 저장 오류:', dbError);
          }
        }
      } catch (storageError) {
        console.error('Storage 저장 중 오류:', storageError);
        // Storage 저장 실패해도 오디오는 반환
      }

      // MP3 파일로 반환
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'Content-Disposition': 'inline; filename="story.mp3"',
        },
      });

    } catch (ttsError) {
      console.error('OpenAI TTS API 오류:', ttsError);
      
      const errorMessage = ttsError instanceof Error ? ttsError.message : 'Unknown error';
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'TTS 생성 중 오류가 발생했습니다.',
          details: errorMessage 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('TTS error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'TTS 생성 중 오류가 발생했습니다.',
        details: errorMessage 
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
        voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
        input: text,
        speed: speed,
      });

      // 오디오 데이터를 Buffer로 변환
      const buffer = Buffer.from(await mp3.arrayBuffer());

      console.log('TTS generation successful (GET):', {
        buffer_size: buffer.length,
        voice: voice
      });

      // Supabase Storage에 TTS 오디오 저장
      try {
        const timestamp = new Date().getTime();
        const fileName = `tts/story_${timestamp}_${voice}.mp3`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(fileName, buffer, {
            contentType: 'audio/mpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase Storage 업로드 오류 (GET):', uploadError);
        } else {
          console.log('Supabase Storage 업로드 성공 (GET):', uploadData.path);
          
          // 데이터베이스에 메타데이터 저장
          const { error: dbError } = await supabase
            .from('tts_files')
            .insert({
              user_id: token,
              file_path: uploadData.path,
              voice: voice,
              speed: speed,
              text_length: text.length,
              file_size: buffer.length,
              created_at: new Date().toISOString()
            });
          
          if (dbError) {
            console.error('TTS 메타데이터 저장 오류 (GET):', dbError);
          }
        }
      } catch (storageError) {
        console.error('Storage 저장 중 오류 (GET):', storageError);
        // Storage 저장 실패해도 오디오는 반환
      }

      // MP3 파일로 반환
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
          'Content-Disposition': 'inline; filename="story.mp3"',
        },
      });

    } catch (ttsError) {
      console.error('OpenAI TTS API 오류 (GET):', ttsError);
      
      const errorMessage = ttsError instanceof Error ? ttsError.message : 'Unknown error';
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'TTS 생성 중 오류가 발생했습니다.',
          details: errorMessage 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('TTS error (GET):', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'TTS 생성 중 오류가 발생했습니다.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

