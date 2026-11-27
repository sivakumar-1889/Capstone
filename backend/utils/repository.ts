import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { isMongoConnected } from '../config/db.ts';
import {
  DifficultyLevel,
  IQuestionItem,
  QuizModel,
  QuizQuestionMode,
} from '../models/Quiz.ts';
import { IAnswerRecord, QuizResultModel } from '../models/QuizResult.ts';
import { UserModel } from '../models/User.ts';
import { escapeRegex } from './validation.ts';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface QuizRecord {
  id: string;
  userId: string;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: QuizQuestionMode;
  language: string;
  questions: IQuestionItem[];
  totalQuestions: number;
  createdAt: string;
}

export interface QuizResultRecord {
  id: string;
  userId: string;
  quizId: string;
  answers: IAnswerRecord[];
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

interface LocalDatabaseSchema {
  users: UserRecord[];
  quizzes: QuizRecord[];
  results: QuizResultRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'quizora.json');

function generateId(): string {
  return crypto.randomBytes(12).toString('hex');
}

function readLocalDb(): LocalDatabaseSchema {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { users: [], quizzes: [], results: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<LocalDatabaseSchema>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      results: Array.isArray(parsed.results) ? parsed.results : [],
    };
  } catch {
    return { users: [], quizzes: [], results: [] };
  }
}

function writeLocalDb(data: LocalDatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, DATA_FILE);
}

function mapMongoUser(doc: {
  _id: unknown;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}): UserRecord {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    password: doc.password,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

function mapMongoQuiz(doc: {
  _id: unknown;
  userId: unknown;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: QuizQuestionMode;
  language: string;
  questions: IQuestionItem[];
  totalQuestions: number;
  createdAt: Date;
}): QuizRecord {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    title: doc.title,
    topic: doc.topic,
    difficulty: doc.difficulty,
    questionType: doc.questionType,
    language: doc.language || 'English',
    questions: doc.questions.map((q) => ({
      questionText: q.questionText,
      type: q.type,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })),
    totalQuestions: doc.totalQuestions,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

function mapMongoResult(doc: {
  _id: unknown;
  userId: unknown;
  quizId: unknown;
  answers: IAnswerRecord[];
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}): QuizResultRecord {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    quizId: String(doc.quizId),
    answers: doc.answers.map((a) => ({
      questionIndex: a.questionIndex,
      selectedAnswer: a.selectedAnswer,
      isCorrect: a.isCorrect,
    })),
    score: doc.score,
    totalQuestions: doc.totalQuestions,
    percentage: doc.percentage,
    completedAt: new Date(doc.completedAt).toISOString(),
  };
}

export const repository = {
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.toLowerCase().trim();
    if (isMongoConnected()) {
      const user = await UserModel.findOne({ email: normalized }).lean();
      return user ? mapMongoUser(user as never) : null;
    }
    const db = readLocalDb();
    return db.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findUserById(id: string): Promise<UserRecord | null> {
    if (isMongoConnected()) {
      const user = await UserModel.findById(id).lean();
      return user ? mapMongoUser(user as never) : null;
    }
    const db = readLocalDb();
    return db.users.find((u) => u.id === id) || null;
  },

  async createUser(input: { name: string; email: string; password: string }): Promise<UserRecord> {
    const normalizedEmail = input.email.toLowerCase().trim();
    if (isMongoConnected()) {
      const created = await UserModel.create({
        name: input.name.trim(),
        email: normalizedEmail,
        password: input.password,
      });
      return mapMongoUser(created.toObject() as never);
    }
    const db = readLocalDb();
    const record: UserRecord = {
      id: generateId(),
      name: input.name.trim(),
      email: normalizedEmail,
      password: input.password,
      createdAt: new Date().toISOString(),
    };
    db.users.push(record);
    writeLocalDb(db);
    return record;
  },

  async updateUser(
    id: string,
    updates: { name?: string; email?: string; password?: string }
  ): Promise<UserRecord | null> {
    if (isMongoConnected()) {
      const doc = await UserModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();
      return doc ? mapMongoUser(doc as never) : null;
    }
    const db = readLocalDb();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    db.users[index] = {
      ...db.users[index],
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.email !== undefined ? { email: updates.email } : {}),
      ...(updates.password !== undefined ? { password: updates.password } : {}),
    };
    writeLocalDb(db);
    return db.users[index];
  },

  async createQuiz(input: {
    userId: string;
    title: string;
    topic: string;
    difficulty: DifficultyLevel;
    questionType: QuizQuestionMode;
    language: string;
    questions: IQuestionItem[];
  }): Promise<QuizRecord> {
    if (isMongoConnected()) {
      const created = await QuizModel.create({
        ...input,
        totalQuestions: input.questions.length,
      });
      return mapMongoQuiz(created.toObject() as never);
    }
    const db = readLocalDb();
    const record: QuizRecord = {
      id: generateId(),
      userId: input.userId,
      title: input.title,
      topic: input.topic,
      difficulty: input.difficulty,
      questionType: input.questionType,
      language: input.language,
      questions: input.questions,
      totalQuestions: input.questions.length,
      createdAt: new Date().toISOString(),
    };
    db.quizzes.unshift(record);
    writeLocalDb(db);
    return record;
  },

  async listQuizzesByUser(
    userId: string,
    filters?: { search?: string; difficulty?: DifficultyLevel | 'All' }
  ): Promise<QuizRecord[]> {
    if (isMongoConnected()) {
      const query: Record<string, unknown> = { userId };
      if (filters?.difficulty && filters.difficulty !== 'All') {
        query.difficulty = filters.difficulty;
      }
      if (filters?.search) {
        const safeRegex = new RegExp(escapeRegex(filters.search), 'i');
        query.$or = [{ topic: safeRegex }, { title: safeRegex }];
      }
      const docs = await QuizModel.find(query).sort({ createdAt: -1 }).lean();
      return docs.map((d) => mapMongoQuiz(d as never));
    }
    const db = readLocalDb();
    let items = db.quizzes.filter((q) => q.userId === userId);
    if (filters?.difficulty && filters.difficulty !== 'All') {
      items = items.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (q) => q.topic.toLowerCase().includes(term) || q.title.toLowerCase().includes(term)
      );
    }
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async findQuizByIdForUser(quizId: string, userId: string): Promise<QuizRecord | null> {
    if (isMongoConnected()) {
      const doc = await QuizModel.findOne({ _id: quizId, userId }).lean();
      return doc ? mapMongoQuiz(doc as never) : null;
    }
    const db = readLocalDb();
    return db.quizzes.find((q) => q.id === quizId && q.userId === userId) || null;
  },

  async deleteQuizForUser(quizId: string, userId: string): Promise<boolean> {
    if (isMongoConnected()) {
      const deleted = await QuizModel.findOneAndDelete({ _id: quizId, userId });
      if (!deleted) return false;
      await QuizResultModel.deleteMany({ quizId, userId });
      return true;
    }
    const db = readLocalDb();
    const exists = db.quizzes.some((q) => q.id === quizId && q.userId === userId);
    if (!exists) return false;
    db.quizzes = db.quizzes.filter((q) => !(q.id === quizId && q.userId === userId));
    db.results = db.results.filter((r) => !(r.quizId === quizId && r.userId === userId));
    writeLocalDb(db);
    return true;
  },

  async createQuizResult(input: {
    userId: string;
    quizId: string;
    answers: IAnswerRecord[];
    score: number;
    totalQuestions: number;
    percentage: number;
  }): Promise<QuizResultRecord> {
    if (isMongoConnected()) {
      const created = await QuizResultModel.create(input);
      return mapMongoResult(created.toObject() as never);
    }
    const db = readLocalDb();
    const record: QuizResultRecord = {
      id: generateId(),
      userId: input.userId,
      quizId: input.quizId,
      answers: input.answers,
      score: input.score,
      totalQuestions: input.totalQuestions,
      percentage: input.percentage,
      completedAt: new Date().toISOString(),
    };
    db.results.unshift(record);
    writeLocalDb(db);
    return record;
  },

  async listResultsByUser(userId: string): Promise<QuizResultRecord[]> {
    if (isMongoConnected()) {
      const docs = await QuizResultModel.find({ userId }).sort({ completedAt: -1 }).lean();
      return docs.map((d) => mapMongoResult(d as never));
    }
    const db = readLocalDb();
    return db.results
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  },

  async findResultByIdForUser(resultId: string, userId: string): Promise<QuizResultRecord | null> {
    if (isMongoConnected()) {
      const doc = await QuizResultModel.findOne({ _id: resultId, userId }).lean();
      return doc ? mapMongoResult(doc as never) : null;
    }
    const db = readLocalDb();
    return db.results.find((r) => r.id === resultId && r.userId === userId) || null;
  },
};
