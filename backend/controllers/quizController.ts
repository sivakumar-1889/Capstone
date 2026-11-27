import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { DifficultyLevel, QuizQuestionMode } from '../models/Quiz.ts';
import { generateQuizWithGemini } from '../services/geminiService.ts';
import { repository } from '../utils/repository.ts';
import { asOptionalString, asTrimmedString, isValidId } from '../utils/validation.ts';

const VALID_DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
const VALID_QUESTION_TYPES: QuizQuestionMode[] = [
  'Multiple choice',
  'True or False',
  'Mixed questions',
];

export async function generateQuiz(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const topic = asTrimmedString(req.body?.topic, 200);
    const studyMaterial = asOptionalString(req.body?.studyMaterial, 12000);
    const numQuestionsRaw = Number(req.body?.numQuestions);
    const difficulty = req.body?.difficulty as DifficultyLevel;
    const questionType = req.body?.questionType as QuizQuestionMode;
    const language = asTrimmedString(req.body?.language, 50) || 'English';

    if (!topic || topic.length < 2) {
      throw new AppError('Please specify a topic or subject (at least 2 characters).', 400, 'INVALID_TOPIC');
    }

    const numQuestions = Number.isInteger(numQuestionsRaw)
      ? Math.min(Math.max(numQuestionsRaw, 1), 20)
      : 5;

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      throw new AppError('Please choose Easy, Medium, or Hard difficulty.', 400, 'INVALID_DIFFICULTY');
    }

    if (!VALID_QUESTION_TYPES.includes(questionType)) {
      throw new AppError('Please choose a valid question type.', 400, 'INVALID_QUESTION_TYPE');
    }

    const generated = await generateQuizWithGemini({
      topic,
      studyMaterial,
      numQuestions,
      difficulty,
      questionType,
      language,
    });

    const saved = await repository.createQuiz({
      userId: req.user.id,
      title: generated.title,
      topic,
      difficulty,
      questionType,
      language,
      questions: generated.questions,
    });

    res.status(201).json({
      success: true,
      quiz: saved,
    });
  } catch (err) {
    next(err);
  }
}

export async function listQuizzes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const search = asOptionalString(req.query?.search, 120);
    const difficultyParam = typeof req.query?.difficulty === 'string' ? req.query.difficulty : 'All';
    const difficulty: DifficultyLevel | 'All' =
      VALID_DIFFICULTIES.includes(difficultyParam as DifficultyLevel)
        ? (difficultyParam as DifficultyLevel)
        : 'All';

    const [quizzes, results] = await Promise.all([
      repository.listQuizzesByUser(req.user.id, { search, difficulty }),
      repository.listResultsByUser(req.user.id),
    ]);

    // Map latest attempt and attempt count per quiz
    const latestResultByQuiz = new Map<
      string,
      { id: string; score: number; percentage: number; completedAt: string; attempts: number }
    >();

    for (const r of results) {
      const existing = latestResultByQuiz.get(r.quizId);
      if (!existing) {
        latestResultByQuiz.set(r.quizId, {
          id: r.id,
          score: r.score,
          percentage: r.percentage,
          completedAt: r.completedAt,
          attempts: 1,
        });
      } else {
        existing.attempts += 1;
      }
    }

    const enriched = quizzes.map((q) => ({
      ...q,
      latestResult: latestResultByQuiz.get(q.id) || null,
    }));

    res.json({
      success: true,
      quizzes: enriched,
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuizById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const quizId = req.params.id;
    if (!isValidId(quizId)) {
      throw new AppError('Invalid quiz identifier.', 400, 'INVALID_ID');
    }

    const quiz = await repository.findQuizByIdForUser(quizId, req.user.id);
    if (!quiz) {
      throw new AppError('Quiz not found.', 404, 'QUIZ_NOT_FOUND');
    }

    res.json({
      success: true,
      quiz,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuiz(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const quizId = req.params.id;
    if (!isValidId(quizId)) {
      throw new AppError('Invalid quiz identifier.', 400, 'INVALID_ID');
    }

    const deleted = await repository.deleteQuizForUser(quizId, req.user.id);
    if (!deleted) {
      throw new AppError('Quiz not found or already deleted.', 404, 'QUIZ_NOT_FOUND');
    }

    res.json({
      success: true,
      message: 'Quiz deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}
