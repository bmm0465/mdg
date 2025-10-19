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
    const { target_communicative_functions, target_grammar_forms, target_vocabulary } = body;

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    try {
      // GPT-4o를 사용한 자료 생성
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `당신은 초등학교 영어 교사입니다. 주어진 학습 목표에 맞는 Short Story와 Teacher's Talk Script를 생성해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "unit": {
    "target_communicative_functions": ["기능1", "기능2"],
    "target_grammar_forms": ["문법1", "문법2"],
    "target_vocabulary": ["단어1", "단어2"]
  },
  "short_story": {
    "title": "이야기 제목",
    "content": "이야기 내용 (초등학생 수준, 80-120단어)",
    "word_count": 단어수,
    "sentence_count": 문장수
  },
  "teacher_script": {
    "opening": ["도입부 질문들"],
    "during_reading": ["읽기 중 활동들"],
    "after_reading": ["읽기 후 질문들"],
    "key_expression_practice": ["핵심 표현 연습"],
    "retelling_guidance": ["리텔링 가이드"],
    "evaluation_criteria": ["평가 기준"],
    "wrap_up": ["마무리 활동들"]
  }
}`
          },
          {
            role: "user",
            content: `다음 학습 목표로 영어 수업 자료를 생성해주세요:

목표 의사소통 기능: ${target_communicative_functions.join(', ')}
목표 문법 형태: ${target_grammar_forms.join(', ')}
목표 어휘: ${target_vocabulary.join(', ')}

초등학생들이 흥미를 가질 수 있는 이야기를 만들고, 교사가 쉽게 사용할 수 있는 상세한 수업 가이드를 제공해주세요.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content;
      
      if (!responseText) {
        throw new Error('OpenAI 응답이 비어있습니다.');
      }

      // JSON 파싱
      let generatedData;
      try {
        generatedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        // JSON 파싱 실패 시 기본 구조로 감싸기
        generatedData = {
          unit: {
            target_communicative_functions,
            target_grammar_forms,
            target_vocabulary
          },
          short_story: {
            title: "AI Generated Story",
            content: responseText,
            word_count: responseText.split(' ').length,
            sentence_count: responseText.split('.').length - 1
          },
          teacher_script: {
            opening: ["Let's read this story together!"],
            during_reading: ["What do you see in the story?"],
            after_reading: ["What did you learn from this story?"],
            key_expression_practice: ["Let's practice the key expressions."],
            retelling_guidance: ["Now, let's tell the story together."],
            evaluation_criteria: ["Can you understand the story?"],
            wrap_up: ["Great job! See you next time!"]
          }
        };
      }

      return NextResponse.json({
        success: true,
        data: generatedData
      });

    } catch (openaiError) {
      console.error('OpenAI API 오류:', openaiError);
      
      // OpenAI API 오류 시 데모 데이터 반환
      const demoData = {
        unit: {
          target_communicative_functions,
          target_grammar_forms,
          target_vocabulary
        },
        short_story: {
          title: "The Magic Garden",
          content: `Once upon a time, there was a little girl named Emma who loved to play in her grandmother's garden. The garden was full of beautiful flowers and tall trees. Emma could see birds flying high in the sky and fish swimming in the small pond. She loved to jump and run around the garden, feeling happy and free. Her grandmother always smiled when she saw Emma playing. "You can do anything you want to do," her grandmother said. Emma felt proud and strong.`,
          word_count: 89,
          sentence_count: 6
        },
        teacher_script: {
          opening: [
            "Good morning, class! Today we're going to read a wonderful story about a little girl and her grandmother's garden.",
            "Before we start, let me ask you: Do you have a garden at home? What can you see in a garden?",
            "Great answers! Now, let's look at the title of our story: 'The Magic Garden'. What do you think this story might be about?"
          ],
          during_reading: [
            "Let's read the first sentence together: 'Once upon a time, there was a little girl named Emma...'",
            "Look at this picture. Can you see Emma? What is she doing?",
            "Now let's read: 'The garden was full of beautiful flowers and tall trees.' Point to the flowers in the picture.",
            "Emma can see birds flying. Can you show me how birds fly? Let's all fly like birds!",
            "What about fish? How do fish swim? Let's swim like fish!"
          ],
          after_reading: [
            "What was Emma's grandmother's garden like?",
            "What animals did Emma see in the garden?",
            "How did Emma feel when she was playing in the garden?",
            "What did Emma's grandmother say to her?",
            "Do you think Emma is happy? Why?"
          ],
          key_expression_practice: [
            "Let's practice: 'I can see...' - I can see birds. I can see fish. I can see flowers.",
            "Now let's practice: 'I can...' - I can jump. I can run. I can play.",
            "Let's practice: 'Can you...?' - Can you see the birds? Can you jump? Can you run?",
            "Answer: 'Yes, I can.' or 'No, I can't.'"
          ],
          retelling_guidance: [
            "Now, let's tell the story together. Who was the main character?",
            "Where did the story happen?",
            "What did Emma do in the garden?",
            "What did Emma see in the garden?",
            "How did Emma feel?",
            "What did her grandmother say?"
          ],
          evaluation_criteria: [
            "Can the student identify the main character?",
            "Can the student name the setting?",
            "Can the student list what Emma saw in the garden?",
            "Can the student express how Emma felt?",
            "Can the student use the key expressions correctly?"
          ],
          wrap_up: [
            "Great job, everyone! You all did wonderful work today.",
            "Let's remember: Emma could see many things in her grandmother's garden.",
            "Just like Emma, you can do many things too!",
            "For homework, draw a picture of your favorite place and tell me what you can see there.",
            "See you next time!"
          ]
        }
      };

      return NextResponse.json({
        success: true,
        data: demoData
      });
    }

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { detail: '자료 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
