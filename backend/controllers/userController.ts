import bcrypt from 'bcryptjs';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { repository } from '../utils/repository.ts';
import { asTrimmedString, isValidEmail } from '../utils/validation.ts';

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const [user, quizzes, results] = await Promise.all([
      repository.findUserById(req.user.id),
      repository.listQuizzesByUser(req.user.id),
      repository.listResultsByUser(req.user.id),
    ]);

    if (!user) {
      throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
    }

    const totalQuizzes = quizzes.length;
    const totalAttempts = results.length;
    const totalQuestionsAnswered = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const averageScore =
      totalAttempts > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts)
        : 0;

    const quizMap = new Map(quizzes.map((q) => [q.id, q]));

    const recentActivity = results.slice(0, 6).map((r) => {
      const quiz = quizMap.get(r.quizId);
      return {
        resultId: r.id,
        quizId: r.quizId,
        title: quiz?.title || 'Quiz Attempt',
        topic: quiz?.topic || 'General',
        difficulty: quiz?.difficulty || 'Medium',
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        completedAt: r.completedAt,
      };
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      stats: {
        totalQuizzes,
        totalAttempts,
        totalQuestionsAnswered,
        averageScore,
      },
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const user = await repository.findUserById(req.user.id);
    if (!user) {
      throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
    }

    const name = asTrimmedString(req.body?.name, 80);
    const emailRaw = asTrimmedString(req.body?.email, 254);
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    const updates: { name?: string; email?: string; password?: string } = {};

    if (name !== null) {
      if (name.length < 2) {
        throw new AppError('Name must be at least 2 characters.', 400, 'INVALID_NAME');
      }
      updates.name = name;
    }

    if (emailRaw !== null) {
      if (!isValidEmail(emailRaw)) {
        throw new AppError('Please provide a valid email address.', 400, 'INVALID_EMAIL');
      }
      const normalizedEmail = emailRaw.toLowerCase();
      if (normalizedEmail !== user.email.toLowerCase()) {
        const existing = await repository.findUserByEmail(normalizedEmail);
        if (existing && existing.id !== user.id) {
          throw new AppError('That email address is already in use.', 409, 'EMAIL_EXISTS');
        }
        updates.email = normalizedEmail;
      }
    }

    if (newPassword.length > 0) {
      if (!currentPassword) {
        throw new AppError(
          'Please enter your current password to set a new password.',
          400,
          'CURRENT_PASSWORD_REQUIRED'
        );
      }
      const matches = await bcrypt.compare(currentPassword, user.password);
      if (!matches) {
        throw new AppError('Current password is incorrect.', 401, 'INCORRECT_PASSWORD');
      }
      if (newPassword.length < 8 || newPassword.length > 128) {
        throw new AppError(
          'New password must be between 8 and 128 characters.',
          400,
          'INVALID_PASSWORD'
        );
      }
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid profile updates were provided.', 400, 'NO_UPDATES');
    }

    const updated = await repository.updateUser(user.id, updates);
    if (!updated) {
      throw new AppError('Failed to update profile.', 500, 'UPDATE_FAILED');
    }

    res.json({
      success: true,
      message: newPassword ? 'Profile and password updated.' : 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
