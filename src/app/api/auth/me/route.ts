import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { detail: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // 간단한 토큰 디코딩 (실제로는 더 안전한 방법 사용)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // 토큰 만료 체크
      if (decoded.exp && Date.now() > decoded.exp) {
        return NextResponse.json(
          { detail: '토큰이 만료되었습니다.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        id: 'demo-user-1',
        email: decoded.email,
        name: decoded.name,
        school: decoded.school,
        role: decoded.role,
        created_at: new Date().toISOString(),
        is_active: true
      });
    } catch {
      return NextResponse.json(
        { detail: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { detail: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
