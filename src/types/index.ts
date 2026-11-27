export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type QuizQuestionMode = 'Multiple choice' | 'True or False' | 'Mixed questions';
export type QuestionItemType = 'multiple-choice' | 'true-false';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface QuestionItem {
  questionText: string;
  type: QuestionItemType;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LatestQuizResultSummary {
  id: string;
  score: number;
  percentage: number;
  completedAt: string;
  attempts: number;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: QuizQuestionMode;
  language: string;
  questions: QuestionItem[];
  totalQuestions: number;
  createdAt: string;
  latestResult?: LatestQuizResultSummary | null;
}

export interface AnswerRecord {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  answers: AnswerRecord[];
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  quizTitle?: string;
  quizTopic?: string;
  quizDifficulty?: DifficultyLevel;
}

export interface DashboardStats {
  totalQuizzes: number;
  totalAttempts: number;
  totalQuestionsAnswered: number;
  averageScore: number;
}

export interface RecentActivityItem {
  resultId: string;
  quizId: string;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface GenerateQuizInput {
  topic: string;
  studyMaterial?: string;
  numQuestions: number;
  difficulty: DifficultyLevel;
  questionType: QuizQuestionMode;
  language: string;
}
