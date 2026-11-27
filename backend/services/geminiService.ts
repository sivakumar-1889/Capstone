import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env.ts';
import {
  DifficultyLevel,
  IQuestionItem,
  QuestionItemType,
  QuizQuestionMode,
} from '../models/Quiz.ts';
import { AppError } from '../middleware/errorHandler.ts';

export interface GenerateQuizParams {
  topic: string;
  studyMaterial?: string;
  numQuestions: number;
  difficulty: DifficultyLevel;
  questionType: QuizQuestionMode;
  language: string;
}

export interface GeneratedQuizPayload {
  title: string;
  questions: IQuestionItem[];
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || env.geminiApiKey;
  if (!apiKey) {
    throw new AppError(
      'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.',
      503,
      'GEMINI_KEY_MISSING'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function validateGeneratedQuiz(
  raw: unknown,
  expectedCount: number,
  requestedMode: QuizQuestionMode
): GeneratedQuizPayload {
  if (!raw || typeof raw !== 'object') {
    throw new AppError('AI returned an invalid quiz structure.', 502, 'AI_INVALID_RESPONSE');
  }

  const obj = raw as { title?: unknown; questions?: unknown };
  const title =
    typeof obj.title === 'string' && obj.title.trim().length > 0
      ? obj.title.trim().slice(0, 150)
      : 'Generated Assessment';

  if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
    throw new AppError('AI did not return any quiz questions.', 502, 'AI_EMPTY_QUESTIONS');
  }

  const validatedQuestions: IQuestionItem[] = [];

  for (const item of obj.questions.slice(0, expectedCount)) {
    if (!item || typeof item !== 'object') continue;
    const q = item as {
      questionText?: unknown;
      type?: unknown;
      options?: unknown;
      correctAnswer?: unknown;
      explanation?: unknown;
    };

    const questionText = typeof q.questionText === 'string' ? q.questionText.trim() : '';
    const explanation =
      typeof q.explanation === 'string' && q.explanation.trim().length > 0
        ? q.explanation.trim()
        : 'Review the core principle behind this concept to confirm why this option is accurate.';

    if (!questionText) continue;

    let itemType: QuestionItemType =
      q.type === 'true-false' ? 'true-false' : 'multiple-choice';

    if (requestedMode === 'Multiple choice') {
      itemType = 'multiple-choice';
    } else if (requestedMode === 'True or False') {
      itemType = 'true-false';
    }

    let options = Array.isArray(q.options)
      ? q.options
          .filter((opt): opt is string => typeof opt === 'string' && opt.trim().length > 0)
          .map((opt) => opt.trim())
      : [];

    let correctAnswer = typeof q.correctAnswer === 'string' ? q.correctAnswer.trim() : '';

    if (itemType === 'true-false') {
      if (options.length !== 2) {
        options = ['True', 'False'];
      }
      const matched = options.find(
        (opt) => opt.toLowerCase() === correctAnswer.toLowerCase()
      );
      if (matched) {
        correctAnswer = matched;
      } else if (correctAnswer.toLowerCase().includes('true')) {
        correctAnswer = options[0];
      } else if (correctAnswer.toLowerCase().includes('false')) {
        correctAnswer = options[1];
      } else {
        correctAnswer = options[0];
      }
    } else {
      // Deduplicate and enforce exactly 4 options for multiple-choice
      const uniqueOptions = Array.from(new Set(options));
      if (uniqueOptions.length < 4) {
        continue;
      }
      options = uniqueOptions.slice(0, 4);
      const exactMatch = options.find(
        (opt) => opt.toLowerCase() === correctAnswer.toLowerCase()
      );
      if (!exactMatch) {
        correctAnswer = options[0];
      } else {
        correctAnswer = exactMatch;
      }
    }

    validatedQuestions.push({
      questionText,
      type: itemType,
      options,
      correctAnswer,
      explanation,
    });
  }

  if (validatedQuestions.length === 0) {
    throw new AppError(
      'Generated questions did not pass structural validation. Please try again.',
      502,
      'AI_VALIDATION_FAILED'
    );
  }

  return {
    title,
    questions: validatedQuestions,
  };
}

async function withExponentialBackoff<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      const errObj = error as { status?: number; message?: string };
      const status = errObj?.status;
      const isRetryable = status === 429 || (status !== undefined && status >= 500);
      if (!isRetryable || attempt > maxRetries) {
        throw error;
      }
      const delayMs = 700 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function generateQuizWithGemini(
  params: GenerateQuizParams
): Promise<GeneratedQuizPayload> {
  const ai = getAiClient();

  const typeInstruction =
    params.questionType === 'Multiple choice'
      ? 'Every question must have type "multiple-choice" with exactly 4 distinct answer choices.'
      : params.questionType === 'True or False'
        ? 'Every question must have type "true-false" with exactly 2 options: ["True", "False"] (or localized equivalent in the requested language).'
        : 'Mix both "multiple-choice" (with exactly 4 distinct options) and "true-false" (with exactly 2 options) questions proportionally.';

  const materialBlock = params.studyMaterial?.trim()
    ? `\nReference study material provided by the user (prioritize facts, terminology, and concepts from this material):\n"""\n${params.studyMaterial.trim().slice(0, 12000)}\n"""\n`
    : '';

  const prompt = `Create a rigorous, accurate educational quiz in ${params.language}.
Topic: ${params.topic}
Difficulty: ${params.difficulty}
Number of questions: ${params.numQuestions}
Question format requirement: ${typeInstruction}
${materialBlock}
Rules:
1. Produce exactly ${params.numQuestions} well-crafted questions calibrated to the ${params.difficulty} difficulty level.
2. For each question, "correctAnswer" must match one of the strings in "options" verbatim.
3. Provide a clear, concise, educational "explanation" (1-2 sentences) explaining why the correct answer is right and addressing common misconceptions.
4. Avoid trivial filler or ambiguous phrasing. Write everything in ${params.language}.`;

  try {
    const response = await withExponentialBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert curriculum designer and assessment architect. Return strictly valid JSON matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'A crisp, professional title for this quiz.',
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionText: {
                      type: Type.STRING,
                      description: 'The clear question prompt.',
                    },
                    type: {
                      type: Type.STRING,
                      description: 'Either "multiple-choice" or "true-false".',
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description:
                        '4 distinct options for multiple-choice, or 2 options for true-false.',
                    },
                    correctAnswer: {
                      type: Type.STRING,
                      description: 'Must exactly match one of the items in options.',
                    },
                    explanation: {
                      type: Type.STRING,
                      description: 'Clear 1-2 sentence explanation for the correct answer.',
                    },
                  },
                  required: [
                    'questionText',
                    'type',
                    'options',
                    'correctAnswer',
                    'explanation',
                  ],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      })
    );

    const jsonText = (response.text ?? '').trim();
    if (!jsonText) {
      throw new AppError('Gemini returned an empty response.', 502, 'AI_EMPTY_RESPONSE');
    }

    const parsed = JSON.parse(jsonText);
    return validateGeneratedQuiz(parsed, params.numQuestions, params.questionType);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    const err = error as { status?: number; message?: string };
    if (err.status === 400 || err.status === 403) {
      throw new AppError(
        'Gemini API authentication failed. Verify GEMINI_API_KEY in Settings > Secrets.',
        502,
        'GEMINI_AUTH_ERROR'
      );
    }
    if (err.status === 429) {
      throw new AppError(
        'Gemini API rate limit reached. Please wait a moment and try again.',
        429,
        'GEMINI_RATE_LIMIT'
      );
    }
    throw new AppError(
      `Quiz generation failed: ${err.message || 'Unexpected AI service error.'}`,
      502,
      'GEMINI_ERROR'
    );
  }
}
