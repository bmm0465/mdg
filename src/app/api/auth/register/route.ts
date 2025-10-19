import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, school } = body;

    // 간단한 유효성 검사
    if (!email || !password || !name) {
      return NextResponse.json(
        { detail: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 실제 Supabase 연동 (선택사항)
    // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    // const { data, error } = await supabase.auth.signUp({ email, password });

    // 데모용 응답
    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      user: {
        email,
        name,
        school: school || '',
        role: 'teacher'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { detail: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
