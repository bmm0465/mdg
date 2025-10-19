import { NextRequest, NextResponse } from 'next/server';

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

    // OpenAI API 호출 (실제 구현에서는 환경변수에서 API 키 가져오기)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // 데모 데이터 반환
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

    // 실제 OpenAI API 호출 (구현 예시)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert English teacher creating materials for elementary school students. Create engaging short stories and detailed teacher scripts.'
          },
          {
            role: 'user',
            content: `Create English teaching materials with these targets:
            - Communicative functions: ${target_communicative_functions.join(', ')}
            - Grammar forms: ${target_grammar_forms.join(', ')}
            - Vocabulary: ${target_vocabulary.join(', ')}
            
            Please provide a short story and detailed teacher script in JSON format.`
          }
        ]
      })
    });

    const data = await response.json();
    
    // 실제 구현에서는 OpenAI 응답을 파싱하여 적절한 형식으로 변환
    return NextResponse.json({
      success: true,
      data: data.choices[0].message.content
    });

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { detail: '자료 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
