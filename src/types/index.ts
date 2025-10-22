// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  school?: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

// 자료 생성 요청 타입
export interface GenerateRequest {
  target_communicative_functions: string[];
  target_grammar_forms: string[];
  target_vocabulary: string[];
}

// 단위 정보 타입
export interface Unit {
  target_communicative_functions: string[];
  target_grammar_forms: string[];
  target_vocabulary: string[];
}

// 단편 소설 타입
export interface ShortStory {
  title: string;
  content: string;
  word_count: number;
  sentence_count: number;
}

// 교사 스크립트 타입
export interface TeacherScript {
  opening: string[];
  during_reading: string[];
  after_reading: string[];
  key_expression_practice: string[];
  retelling_guidance: string[];
  evaluation_criteria: string[];
  wrap_up: string[];
}

// 어휘 빈칸 채우기 활동 타입
export interface VocabularyFillActivity {
  modified_story: string;
  blanks: {
    id: string;
    correct_answer: string;
    type: string;
    hint?: string;
  }[];
  word_bank: string[];
}

// 전체 다시 쓰기 활동 타입
export interface FullRewriteActivity {
  story_structure: {
    setting: string;
    characters: string;
    problem: string;
    events: string[];
    resolution: string;
    theme: string;
  };
  rewrite_guide: string;
  story_grammar_rubric: {
    setting: string[];
    characters: string[];
    problem: string[];
    events: string[];
    resolution: string[];
    theme: string[];
    vocabulary: string[];
    grammar: string[];
    coherence: string[];
  };
}

// Rewrite 활동 타입
export interface RewriteActivities {
  vocabulary_fill: VocabularyFillActivity;
  full_rewrite: FullRewriteActivity;
}

// 생성된 자료 타입
export interface GeneratedData {
  unit: Unit;
  short_story: ShortStory;
  teacher_script: TeacherScript;
  rewrite_activities?: RewriteActivities;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 예시 데이터 타입
export interface ExampleData {
  target_communicative_functions: string[];
  target_grammar_forms: string[];
  target_vocabulary: string[];
}

// 예시 데이터 API 응답 타입
export interface ExampleResponse {
  success: boolean;
  data: ExampleData;
}

// 자료 생성 API 응답 타입
export interface GenerateResponse {
  success: boolean;
  data?: GeneratedData;
  error?: string;
}
