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

// 로그인 응답 타입
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
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

// 생성된 자료 타입
export interface GeneratedData {
  unit: Unit;
  short_story: ShortStory;
  teacher_script: TeacherScript;
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
  user: {
    email: string;
    name: string;
    school: string;
    role: string;
  };
}
