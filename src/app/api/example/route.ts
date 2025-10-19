import { NextRequest, NextResponse } from 'next/server';

// 간단한 인증 체크 함수
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

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

    // 예시 데이터
    const exampleData = {
      target_communicative_functions: [
        "능력 묻고 답하기",
        "감정 묻고 답하기",
        "소유 표현하기"
      ],
      target_grammar_forms: [
        "I can...",
        "Can you...?",
        "Yes, I can. / No, I can't.",
        "I have...",
        "Do you have...?"
      ],
      target_vocabulary: [
        "bird",
        "fish", 
        "frog",
        "fly",
        "swim",
        "jump",
        "happy",
        "sad",
        "angry",
        "tired"
      ]
    };

    return NextResponse.json({
      success: true,
      data: exampleData
    });

  } catch (error) {
    console.error('Example error:', error);
    return NextResponse.json(
      { detail: '예시 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
