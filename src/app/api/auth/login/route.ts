import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 데모 계정 체크
    if (email === 'demo@example.com' && password === 'demo123') {
      // 간단한 JWT 토큰 생성 (실제로는 더 안전한 방법 사용)
      const token = Buffer.from(JSON.stringify({
        email: 'demo@example.com',
        name: '데모 사용자',
        school: '데모 초등학교',
        role: 'teacher',
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간
      })).toString('base64');

      return NextResponse.json({
        access_token: token,
        token_type: 'bearer',
        user: {
          id: 'demo-user-1',
          email: 'demo@example.com',
          name: '데모 사용자',
          school: '데모 초등학교',
          role: 'teacher',
          created_at: new Date().toISOString(),
          is_active: true
        }
      });
    }

    // 실제 Supabase 연동 (선택사항)
    // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    return NextResponse.json(
      { detail: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { detail: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
