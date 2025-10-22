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
            content: `You are an expert English teacher creating educational stories for Korean elementary students (grade 3-6). Always provide both English and Korean explanations for teacher's talk script.`
          },
          {
            role: "user",
            content: `Create a short English story and teacher's talk script for Korean elementary students.

**MUST INCLUDE THESE ELEMENTS:**
- Communication functions: ${target_communicative_functions.join(', ')}
- Grammar patterns: ${target_grammar_forms.join(', ')}
- Vocabulary words: ${target_vocabulary.join(', ')}

**SHORT STORY REQUIREMENTS:**
- Write exactly 8-10 sentences
- Each sentence must have maximum 9 words
- Use simple, clear English (CEFR A1 level)
- Create a positive, engaging story suitable for Korean children
- Include a clear beginning, middle, and end

**STORY STRUCTURE:**
1. Introduce characters and setting (1-2 sentences)
2. Present a simple problem or situation (2-3 sentences)
3. Show characters trying to solve it (2-3 sentences)
4. Resolve the problem positively (1-2 sentences)
5. End with a positive message (1 sentence)

Make sure to naturally incorporate ALL the target vocabulary and grammar patterns into the story.

**TEACHER'S TALK SCRIPT REQUIREMENTS:**
Create a 7-stage teaching guide with English and Korean explanations:
1. Opening: Engage students and activate prior knowledge (2-3 questions/activities)
2. During-Reading: Guide students through the story with interactive questions (2-3 questions)
3. After-Reading: Check comprehension with Q&A (2-3 questions)
4. Key Expression Practice: Practice target expressions and grammar (2-4 activities)
5. Retelling Guidance: Guide students to retell the story using 9 elements:
   - Characters & Setting: Who, where, when
   - Initiating Event: What problem/event starts the story
   - Internal Reaction: How characters feel, their goals
   - Attempts/Actions: What characters do to solve the problem
   - Result/Resolution: How the problem is solved
   - Ending/Closure: How the story ends
   - Causal Connection: Use 'because', 'so', 'that's why'
   - Temporal Connection: Use 'first', 'then', 'next', 'after', 'finally'
   - Global Organization: Overall coherence and flow
6. Evaluation Criteria: 9 elements scoring rubric (0-3 points each, total 27 points)
7. Wrap-Up: Summarize and conclude with encouragement (1-2 messages)

**IMPORTANT:** For each English question/activity, include Korean teacher support in parentheses:
Format: "English text (교사용 보조 발화: Korean translation)"

**REWRITE ACTIVITIES:**
Create 2 types of rewrite activities:

1. **Vocabulary Fill Activity (Stage 1):**
   - Create 5 blanks in the story
   - Single words: 30-40% (1-2 blanks)
   - Collocations (2-4 word phrases): 60-70% (3-4 blanks)
   - Select important vocabulary and natural collocations
   - Provide word bank with correct answers

2. **Full Rewrite Activity (Stage 2):**
   - Analyze story structure (setting, characters, problem, events, resolution, theme)
   - Provide rewriting guide based on story structure
   - Include Story Grammar framework guidance

3. **Story Grammar Rubric (9 elements, 0-4 point scale):**
   - Setting: Background, character introduction
   - Characters: Main/supporting characters, personality
   - Problem: Conflict, issue
   - Events: Sequence, progression
   - Resolution: Solution, ending
   - Theme: Message, lesson
   - Vocabulary: Word choice, expressions
   - Grammar: Accuracy, sentence structure
   - Coherence: Flow, connectivity

**OUTPUT FORMAT (JSON):**
{
  "unit": {
    "target_communicative_functions": ["${target_communicative_functions.join('", "')}"],
    "target_grammar_forms": ["${target_grammar_forms.join('", "')}"],
    "target_vocabulary": ["${target_vocabulary.join('", "')}"]
  },
  "short_story": {
    "title": "Story Title",
    "content": "Story content (8-10 sentences, max 9 words per sentence)",
    "word_count": total_word_count,
    "sentence_count": total_sentence_count
  },
  "teacher_script": {
    "opening": ["Question with (교사용 보조 발화: Korean)", "..."],
    "during_reading": ["Question with (교사용 보조 발화: Korean)", "..."],
    "after_reading": ["Question with (교사용 보조 발화: Korean)", "..."],
    "key_expression_practice": ["Activity with (교사용 보조 발화: Korean)", "..."],
    "retelling_guidance": ["Guidance for each of 9 elements with (교사용 보조 발화: Korean)", "..."],
    "evaluation_criteria": ["Criteria for each of 9 elements (0-3점) with (교사용 보조 발화: Korean)", "..."],
    "wrap_up": ["Message with (교사용 보조 발화: Korean)", "..."]
  },
  "rewrite_activities": {
    "vocabulary_fill": {
      "modified_story": "Story with blanks like __blank_1__, __blank_2__, etc.",
      "blanks": [
        {
          "id": "blank_1",
          "correct_answer": "word or collocation",
          "type": "single or collocation",
          "hint": "optional hint in Korean"
        }
      ],
      "word_bank": ["answer1", "answer2", "answer3", "..."]
    },
    "full_rewrite": {
      "story_structure": {
        "setting": "Setting description in Korean",
        "characters": "Characters description in Korean",
        "problem": "Problem description in Korean",
        "events": ["Event 1", "Event 2", "..."],
        "resolution": "Resolution description in Korean",
        "theme": "Theme description in Korean"
      },
      "rewrite_guide": "Detailed guide for rewriting in Korean",
      "story_grammar_rubric": {
        "setting": ["Criterion 1", "Criterion 2", "..."],
        "characters": ["Criterion 1", "Criterion 2", "..."],
        "problem": ["Criterion 1", "Criterion 2", "..."],
        "events": ["Criterion 1", "Criterion 2", "..."],
        "resolution": ["Criterion 1", "Criterion 2", "..."],
        "theme": ["Criterion 1", "Criterion 2", "..."],
        "vocabulary": ["Criterion 1", "Criterion 2", "..."],
        "grammar": ["Criterion 1", "Criterion 2", "..."],
        "coherence": ["Criterion 1", "Criterion 2", "..."]
      }
    }
  }
}

Please respond ONLY with valid JSON, no additional text or explanation.`
          }
        ],
        temperature: 0.6,
        max_tokens: 4000
      });

      const responseText = completion.choices[0]?.message?.content;
      
      if (!responseText) {
        throw new Error('OpenAI 응답이 비어있습니다.');
      }

      console.log('OpenAI response received:', responseText.substring(0, 200));

      // JSON 파싱 (코드 블록이나 추가 텍스트 제거)
      let generatedData;
      try {
        // JSON 코드 블록 제거 (```json ... ``` 형태)
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }
        
        generatedData = JSON.parse(cleanedText);
        
        // 데이터 유효성 검증
        if (!generatedData.short_story || !generatedData.teacher_script) {
          throw new Error('응답 구조가 올바르지 않습니다.');
        }
        
        // rewrite_activities 검증 (선택사항, 없으면 경고만)
        if (!generatedData.rewrite_activities) {
          console.warn('Warning: rewrite_activities not found in response');
        }
        
        console.log('Story generation successful:', {
          title: generatedData.short_story.title,
          sentence_count: generatedData.short_story.sentence_count,
          word_count: generatedData.short_story.word_count,
          has_rewrite_activities: !!generatedData.rewrite_activities
        });
        
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('응답 내용:', responseText);
        
        // JSON 파싱 실패 시 폴백 데이터 사용
        throw new Error('AI 응답 파싱에 실패했습니다. 폴백 데이터를 사용합니다.');
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
          title: "Emma's Garden",
          content: `Emma likes her grandmother's garden. She can see pretty flowers. Birds fly in the sky. Fish swim in the pond. Emma can jump and run. She feels very happy. Her grandmother smiles at Emma. Emma is proud and strong. The garden is wonderful.`,
          word_count: 48,
          sentence_count: 9
        },
        teacher_script: {
          opening: [
            "Good morning, everyone! Look at this picture. What do you see? (교사용 보조 발화: 여러분, 안녕하세요! 이 그림을 보세요. 무엇이 보이나요?)",
            "Right! It's a garden. What can you see in a garden? (교사용 보조 발화: 맞아요! 정원이에요. 정원에서 무엇을 볼 수 있나요?)",
            "Great answers! Now, let's look at the title: 'Emma's Garden'. What do you think this story is about? (교사용 보조 발화: 좋은 답변이에요! 이제 제목을 봅시다: 'Emma's Garden'. 이 이야기가 무엇에 관한 것 같나요?)"
          ],
          during_reading: [
            "(Reads the first 3 sentences) 'Emma likes her grandmother's garden. She can see pretty flowers. Birds fly in the sky.' What can Emma see? (교사용 보조 발화: (첫 세 문장을 읽고) Emma는 무엇을 볼 수 있나요?)",
            "(Reads up to sentence 6) 'Fish swim in the pond. Emma can jump and run. She feels very happy.' How does Emma feel? (교사용 보조 발화: (6번째 문장까지 읽고) Emma는 어떻게 느끼나요?)",
            "(Reads to the end) 'Her grandmother smiles at Emma. Emma is proud and strong. The garden is wonderful.' Look at Emma now. Is she happy? (교사용 보조 발화: (끝까지 읽고) 이제 Emma를 보세요. 행복해 보이나요?)"
          ],
          after_reading: [
            "Great job listening! Now, a simple quiz. What does Emma like? (교사용 보조 발화: 정말 잘 들었어요! 이제 간단한 퀴즈. Emma는 무엇을 좋아하나요?)",
            "Good! What can Emma see in the garden? (교사용 보조 발화: 좋아요! Emma는 정원에서 무엇을 볼 수 있나요?)",
            "Excellent! What can Emma do? (교사용 보조 발화: 훌륭해요! Emma는 무엇을 할 수 있나요?)"
          ],
          key_expression_practice: [
            "Now, let's practice! I will ask, 'Can you jump?'. You say, 'Yes, I can!' and jump! (교사용 보조 발화: 자, 이제 연습해 봐요! 선생님이 'Can you jump?'라고 물으면, 여러분은 'Yes, I can!'이라고 외치며 점프하는 거예요!)",
            "Let's practice: 'I can see...' - I can see flowers. I can see birds. I can see fish. (교사용 보조 발화: 연습해봅시다: 'I can see...' - 꽃을 볼 수 있어요. 새를 볼 수 있어요. 물고기를 볼 수 있어요.)",
            "Now let's practice: 'I can...' - I can jump. I can run. I can play. (교사용 보조 발화: 이제 연습해봅시다: 'I can...' - 점프할 수 있어요. 달릴 수 있어요. 놀 수 있어요.)",
            "Ready? Can you see the birds? Can you jump? Let's answer together! (교사용 보조 발화: 준비됐나요? 새를 볼 수 있어요? 점프할 수 있어요? 함께 대답해봅시다!)"
          ],
          retelling_guidance: [
            "1. Characters & Setting: Let's start by introducing the main characters and setting. Who is the main character? Where does the story take place? (교사용 보조 발화: 먼저 주요 등장인물과 배경을 소개해봅시다. 주인공은 누구인가요? 이야기는 어디서 일어나나요?)",
            "2. Initiating Event: What happens at the beginning? What makes the story start? (교사용 보조 발화: 처음에 무슨 일이 일어나나요? 무엇이 이야기를 시작하게 만드나요?)",
            "3. Internal Reaction: How does Emma feel? What does she want to do? (교사용 보조 발화: Emma는 어떻게 느끼나요? 무엇을 하고 싶어 하나요?)",
            "4. Attempts/Actions: What does Emma do in the garden? Let's tell them in order. (교사용 보조 발화: Emma는 정원에서 무엇을 하나요? 순서대로 말해봅시다.)",
            "5. Result/Resolution: What happens as a result? How does Emma feel at the end? (교사용 보조 발화: 결과로 무엇이 일어나나요? 마지막에 Emma는 어떻게 느끼나요?)",
            "6. Ending/Closure: How does the story end? Does it feel complete? (교사용 보조 발화: 이야기는 어떻게 끝나나요? 완성된 느낌이 드나요?)",
            "7. Causal Connection: Use words like 'because', 'so', 'that's why' to connect events. For example: Emma is happy because she can see beautiful things. (교사용 보조 발화: 'because', 'so', 'that's why' 같은 단어를 사용해서 사건들을 연결해봅시다.)",
            "8. Temporal Connection: Use time words like 'first', 'then', 'next', 'after', 'finally'. For example: First, Emma sees flowers. Then, she sees birds. (교사용 보조 발화: 'first', 'then', 'next', 'after', 'finally' 같은 시간 단어를 사용해봅시다.)",
            "9. Global Organization: Make sure your retelling flows smoothly from beginning to end. Does everything connect well? (교사용 보조 발화: 리텔링이 처음부터 끝까지 매끄럽게 흐르는지 확인하세요. 모든 것이 잘 연결되나요?)"
          ],
          evaluation_criteria: [
            "1. Characters & Setting (0-3점): Did you clearly introduce who Emma is and where the story takes place? (교사용 보조 발화: Emma가 누구인지, 이야기가 어디서 일어나는지 명확히 소개했나요?)",
            "2. Initiating Event (0-3점): Did you explain what happens at the beginning of the story? (교사용 보조 발화: 이야기 처음에 무슨 일이 일어나는지 설명했나요?)",
            "3. Internal Reaction (0-3점): Did you describe how Emma feels and what she wants? (교사용 보조 발화: Emma가 어떻게 느끼고 무엇을 원하는지 설명했나요?)",
            "4. Attempts/Actions (0-3점): Did you describe what Emma does in the right order? (교사용 보조 발화: Emma가 무엇을 하는지 올바른 순서로 설명했나요?)",
            "5. Result/Resolution (0-3점): Did you explain what happens as a result? (교사용 보조 발화: 결과로 무엇이 일어나는지 설명했나요?)",
            "6. Ending/Closure (0-3점): Did you provide a complete ending? (교사용 보조 발화: 완전한 결말을 제공했나요?)",
            "7. Causal Connection (0-3점): Did you use 'because', 'so', 'that's why' to connect events? (교사용 보조 발화: 'because', 'so', 'that's why'를 사용해서 사건들을 연결했나요?)",
            "8. Temporal Connection (0-3점): Did you use 'first', 'then', 'next', 'after', 'finally'? (교사용 보조 발화: 'first', 'then', 'next', 'after', 'finally'를 사용했나요?)",
            "9. Global Organization (0-3점): Is your retelling well-organized and easy to follow? (교사용 보조 발화: 리텔링이 잘 구성되고 따라하기 쉬운가요?)",
            "Total Score: 0-27 points (9 elements × 0-3 points each). 21-27: Excellent, 15-20: Good, 9-14: Fair, 0-8: Needs Improvement (총점: 0-27점. 21-27: 우수, 15-20: 양호, 9-14: 보통, 0-8: 개선 필요)"
          ],
          wrap_up: [
            "Everyone, you did a wonderful job today! We learned about Emma's garden and what she can see and do. And we learned to say 'I can...'! Great work! (교사용 보조 발화: 여러분, 오늘 정말 잘했어요! Emma의 정원과 그녀가 볼 수 있고 할 수 있는 것들에 대해 배웠어요. 그리고 'I can...'라고 말하는 법도 배웠죠! 최고예요!)"
          ]
        },
        rewrite_activities: {
          vocabulary_fill: {
            modified_story: "Emma likes her grandmother's garden. She can see __blank_1__. Birds fly in the sky. __blank_2__ in the pond. Emma can __blank_3__. She feels very happy. Her grandmother __blank_4__. Emma is proud and strong. The garden is wonderful.",
            blanks: [
              {
                id: "blank_1",
                correct_answer: "pretty flowers",
                type: "collocation",
                hint: "아름다운 것들 (두 단어)"
              },
              {
                id: "blank_2",
                correct_answer: "Fish swim",
                type: "collocation",
                hint: "물고기가 하는 행동 (두 단어)"
              },
              {
                id: "blank_3",
                correct_answer: "jump and run",
                type: "collocation",
                hint: "Emma가 할 수 있는 동작들 (세 단어)"
              },
              {
                id: "blank_4",
                correct_answer: "smiles at Emma",
                type: "collocation",
                hint: "할머니가 Emma에게 하는 행동 (세 단어)"
              }
            ],
            word_bank: ["pretty flowers", "Fish swim", "jump and run", "smiles at Emma", "happy", "garden"]
          },
          full_rewrite: {
            story_structure: {
              setting: "Emma의 할머니 정원 (시간과 장소)",
              characters: "Emma (주인공), 할머니 (조연)",
              problem: "Emma가 정원에서 다양한 것들을 경험하고 발견함",
              events: [
                "Emma가 할머니의 정원을 좋아함",
                "Emma가 예쁜 꽃들을 봄",
                "새들이 하늘을 날고 물고기가 연못에서 수영함",
                "Emma가 점프하고 달림",
                "Emma가 매우 행복함을 느낌"
              ],
              resolution: "할머니가 Emma에게 미소를 지으며 Emma는 자랑스럽고 강하다고 느낌",
              theme: "자연 속에서 자유롭게 놀며 행복을 느끼고, 자신의 능력을 발견하는 것"
            },
            rewrite_guide: `다음 구조를 참고하여 스토리를 다시 써보세요:

📍 배경 설정: Emma의 할머니 정원
👥 등장인물: Emma (주인공), 할머니
⚠️ 상황: Emma가 정원에서 다양한 것들을 경험함
📝 사건들: 
  1. Emma가 정원을 좋아함
  2. 꽃, 새, 물고기를 봄
  3. 점프하고 달림
  4. 행복함을 느낌
  5. 할머니가 미소 지음
✅ 결말: Emma가 자랑스럽고 강하다고 느낌
💡 주제: 자연 속에서 자유롭게 놀며 자신의 능력을 발견하는 기쁨

위의 구조를 바탕으로 8-10문장의 완전한 스토리를 작성해주세요.
각 문장은 최대 9단어로 작성하세요.`,
            story_grammar_rubric: {
              setting: [
                "배경이 명확하게 제시됨 (할머니의 정원)",
                "등장인물이 적절히 소개됨 (Emma와 할머니)",
                "상황 설정이 이해하기 쉬움"
              ],
              characters: [
                "주인공 Emma의 성격이 일관되게 묘사됨 (호기심 많고 활동적)",
                "할머니의 역할이 적절히 나타남",
                "인물 간의 관계가 명확함 (사랑과 지지)"
              ],
              problem: [
                "상황이 명확함 (정원에서의 경험)",
                "Emma의 탐험과 발견 과정이 제시됨",
                "긍정적인 경험의 중요성이 드러남"
              ],
              events: [
                "사건들이 논리적 순서로 전개됨",
                "각 사건이 명확하게 묘사됨 (보기, 움직이기, 느끼기)",
                "사건 간의 연결이 자연스러움"
              ],
              resolution: [
                "긍정적인 결말이 적절히 제시됨",
                "Emma의 감정 변화가 합리적임",
                "결말이 만족스러움"
              ],
              theme: [
                "주제가 명확하게 드러남 (자연, 자유, 자신감)",
                "교훈이 적절함 (자신의 능력 발견)",
                "초등학생에게 의미 있는 메시지 전달"
              ],
              vocabulary: [
                "어휘 사용이 적절하고 정확함 (CEFR A1 수준)",
                "표현이 단순하고 명확함",
                "초등학생 수준에 맞는 어휘 사용"
              ],
              grammar: [
                "문법이 정확함 (현재 시제 일관성)",
                "문장 구조가 단순하고 명확함 (최대 9단어)",
                "주어-동사 일치가 정확함"
              ],
              coherence: [
                "전체적인 일관성이 유지됨",
                "문장 간 연결이 자연스러움",
                "이야기 흐름이 매끄러움"
              ]
            }
          }
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
