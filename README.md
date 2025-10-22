# 🎓 영어 수업 자료 자동 생성 시스템 (Next.js)

AI 기반 초등학교 영어 수업 자료 자동 생성 시스템입니다. Next.js와 Vercel을 사용하여 구축되었습니다.

## ✨ 주요 기능

- **AI 기반 자료 생성**: GPT-4o를 활용한 고품질 Short Story와 Teacher's Talk Script 자동 생성
- **맞춤형 수업 자료**: 목표 의사소통 기능, 문법, 어휘에 맞는 개인화된 자료 생성
- **TTS (Text-to-Speech)**: OpenAI TTS API를 통한 자연스러운 스토리 음성 재생 ⭐ NEW
- **Rewrite 활동**: 어휘 빈칸 채우기와 전체 스토리 다시 쓰기 활동 자동 생성 ⭐ NEW
- **Story Grammar 루브릭**: 9개 영역 기반 체계적인 평가 기준 제공 ⭐ NEW
- **사용자 인증**: JWT 기반 로그인/회원가입 시스템
- **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화된 UI
- **실시간 생성**: OpenAI GPT-4o API를 통한 실시간 자료 생성

## 🚀 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: Supabase (선택사항)
- **AI**: OpenAI GPT-4o
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd cnue-mck-nextjs
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp env.example .env.local
```

`.env.local` 파일을 열어 필요한 환경변수를 설정하세요:

```env
# OpenAI API Key (필수 - GPT-4o 사용을 위해 필요)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Supabase 설정 (선택사항)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🌐 Vercel 배포

### 1. Vercel 계정 연결
- [Vercel](https://vercel.com)에 가입
- GitHub 저장소와 연결

### 2. 환경변수 설정
Vercel 대시보드에서 다음 환경변수를 설정하세요:
- `OPENAI_API_KEY`: OpenAI API 키 (GPT-4o 사용을 위해 필수)
- `SUPABASE_URL`: Supabase URL (선택사항)
- `SUPABASE_ANON_KEY`: Supabase Anon Key (선택사항)

### 3. 자동 배포
GitHub에 푸시하면 자동으로 배포됩니다.

## 🎯 사용 방법

### 1. 로그인
- 데모 계정: `demo@example.com` / `demo123`
- 또는 새 계정 생성

### 2. 자료 생성
1. 목표 의사소통 기능 입력
2. 목표 문법 형태 입력  
3. 목표 어휘 입력
4. "자료 생성하기" 버튼 클릭

### 3. 결과 확인
- **Short Story**: 생성된 이야기 내용
  - 🔊 **스토리 듣기**: TTS 버튼을 클릭하여 자연스러운 음성으로 스토리 재생
- **Teacher Script**: 7단계 구조의 상세한 수업 가이드
  - Opening, During-Reading, After-Reading
  - Key Expression Practice
  - Retelling Guidance (9개 영역)
  - Evaluation Criteria (0-3점 척도)
  - Wrap-Up
- **Rewrite Activities**: 2단계 쓰기 활동
  - 1단계: 어휘 빈칸 채우기 (단일 단어 + collocation)
  - 2단계: Story Grammar 기반 전체 스토리 다시 쓰기
- **Unit Info**: 수업 목표 정보

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/           # API 라우트
│   │   ├── auth/      # 인증 관련 API
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── me/
│   │   ├── generate/  # 자료 생성 API
│   │   ├── tts/       # TTS API ⭐ NEW
│   │   └── example/   # 예시 데이터 API
│   ├── dashboard/     # 대시보드 페이지
│   └── page.tsx       # 홈페이지 (로그인)
├── components/        # React 컴포넌트
│   ├── LoginForm.tsx
│   ├── MaterialGenerator.tsx
│   ├── GeneratedContent.tsx
│   ├── StoryAudioPlayer.tsx  ⭐ NEW
│   └── UserInfo.tsx
├── types/             # TypeScript 타입 정의
│   └── index.ts
└── ...
```

## 🔧 개발

### 코드 스타일
- TypeScript 사용
- ESLint 설정 적용
- Prettier 설정 적용

### 주요 컴포넌트
- `LoginForm`: 로그인/회원가입 폼
- `MaterialGenerator`: 자료 생성 폼
- `GeneratedContent`: 생성된 자료 표시
- `StoryAudioPlayer`: TTS 기반 스토리 오디오 플레이어 ⭐ NEW
- `UserInfo`: 사용자 정보 표시

## 📝 API 문서

### 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/me` - 사용자 정보 조회

### 자료 생성 API
- `POST /api/generate` - 자료 생성 (Short Story, Teacher Script, Rewrite Activities 포함)
- `GET /api/example` - 예시 데이터 조회

### TTS API ⭐ NEW
- `POST /api/tts` - 텍스트를 음성으로 변환
  - **Request Body**:
    ```json
    {
      "text": "스토리 텍스트",
      "voice": "nova",  // alloy, echo, fable, onyx, nova, shimmer
      "speed": 1.0      // 0.25 ~ 4.0
    }
    ```
  - **Response**: MP3 오디오 파일 (audio/mpeg)
  - **추천 음성**: 
    - `nova` (여성, 부드럽고 자연스러움) ⭐ 추천
    - `shimmer` (여성, 밝고 활기참)
    - `alloy` (중성, 안정적)

- `GET /api/tts?text=...&voice=nova&speed=1.0` - 쿼리 파라미터로 TTS 생성

### TTS 사용 예시

#### 1. React 컴포넌트에서 사용
```tsx
import StoryAudioPlayer from '@/components/StoryAudioPlayer';

// 컴포넌트 내에서
<StoryAudioPlayer
  storyText={shortStory.content}
  storyTitle={shortStory.title}
  voice="nova"
  speed={1.0}
  token={authToken}
/>
```

#### 2. API 직접 호출
```javascript
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    text: "Emma likes her grandmother's garden.",
    voice: 'nova',
    speed: 1.0,
  }),
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

#### 3. 음성 옵션

| 음성 | 성별 | 특징 | 추천 용도 |
|------|------|------|-----------|
| **nova** | 여성 | 부드럽고 자연스러움 | 초등학생 스토리 읽기 ⭐ |
| **shimmer** | 여성 | 밝고 활기참 | 동화, 재미있는 이야기 |
| **alloy** | 중성 | 안정적이고 명확함 | 설명, 지시사항 |
| **echo** | 남성 | 깊고 안정적 | 내레이션 |
| **fable** | 남성 | 따뜻하고 친근함 | 교육 콘텐츠 |
| **onyx** | 남성 | 권위 있고 명확함 | 공식적인 내용 |

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.