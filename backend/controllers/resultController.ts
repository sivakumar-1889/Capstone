import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { IAnswerRecord } from '../models/QuizResult.ts';
import { repository } from '../utils/repository.ts';
import { isValidId } from '../utils/validation.ts';

export async function submitResult(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const quizId = req.body?.quizId;
    const rawAnswers = req.body?.answers;

    if (!isValidId(quizId)) {
      throw new AppError('Invalid quiz identifier.', 400, 'INVALID_QUIZ_ID');
    }

    if (!Array.isArray(rawAnswers)) {
      throw new AppError('Submitted answers must be an array.', 400, 'INVALID_ANSWERS');
    }

    const quiz = await repository.findQuizByIdForUser(quizId, req.user.id);
    if (!quiz) {
      throw new AppError('Quiz not found or unauthorized.', 404, 'QUIZ_NOT_FOUND');
    }

    // Build lookup map of submitted answers by questionIndex
    const submittedMap = new Map<number, string>();
    for (const entry of rawAnswers) {
      if (
        entry &&
        typeof entry === 'object' &&
        Number.isInteger(entry.questionIndex) &&
        typeof entry.selectedAnswer === 'string'
      ) {
        submittedMap.set(entry.questionIndex, entry.selectedAnswer.trim());
      }
    }

    let score = 0;
    const gradedAnswers: IAnswerRecord[] = quiz.questions.map((question, idx) => {
      const selectedAnswer = submittedMap.get(idx) ?? '';
      const isCorrect =
        selectedAnswer.length > 0 &&
        selectedAnswer.toLowerCase() === question.correctAnswer.trim().toLowerCase();
      if (isCorrect) score += 1;
      return {
        questionIndex: idx,
        selectedAnswer: selectedAnswer || 'Unanswered',
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const savedResult = await repository.createQuizResult({
      userId: req.user.id,
      quizId: quiz.id,
      answers: gradedAnswers,
      score,
      totalQuestions,
      percentage,
    });

    res.status(201).json({
      success: true,
      result: savedResult,
      quiz,
    });
  } catch (err) {
    next(err);
  }
}

export async function listResults(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const [results, quizzes] = await Promise.all([
      repository.listResultsByUser(req.user.id),
      repository.listQuizzesByUser(req.user.id),
    ]);

    const quizMap = new Map(quizzes.map((q) => [q.id, q]));

    const enriched = results.map((r) => {
      const quiz = quizMap.get(r.quizId);
      return {
        ...r,
        quizTitle: quiz?.title || 'Deleted Quiz',
        quizTopic: quiz?.topic || 'Unknown Topic',
        quizDifficulty: quiz?.difficulty || 'Medium',
      };
    });

    res.json({
      success: true,
      results: enriched,
    });
  } catch (err) {
    next(err);
  }
}

export async function getResultById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const resultId = req.params.id;
    if (!isValidId(resultId)) {
      throw new AppError('Invalid result identifier.', 400, 'INVALID_ID');
    }

    const result = await repository.findResultByIdForUser(resultId, req.user.id);
    if (!result) {
      throw new AppError('Quiz result not found.', 404, 'RESULT_NOT_FOUND');
    }

    const quiz = await repository.findQuizByIdForUser(result.quizId, req.user.id);
    if (!quiz) {
      throw new AppError('Associated quiz was not found.', 404, 'QUIZ_NOT_FOUND');
    }

    res.json({
      success: true,
      result,
      quiz,
    });
  } catch (err) {
    next(err);
  }
}
