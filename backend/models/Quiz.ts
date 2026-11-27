import mongoose, { Document, Schema, Types } from 'mongoose';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type QuizQuestionMode = 'Multiple choice' | 'True or False' | 'Mixed questions';
export type QuestionItemType = 'multiple-choice' | 'true-false';

export interface IQuestionItem {
  questionText: string;
  type: QuestionItemType;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IQuiz extends Document {
  userId: Types.ObjectId;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: QuizQuestionMode;
  language: string;
  questions: IQuestionItem[];
  totalQuestions: number;
  createdAt: Date;
}

const QuestionItemSchema = new Schema<IQuestionItem>(
  {
    questionText: { type: String, required: true, trim: true },
    type: { type: String, enum: ['multiple-choice', 'true-false'], required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length >= 2 && arr.length <= 4,
        message: 'Options must contain 2 to 4 choices',
      },
    },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    questionType: {
      type: String,
      enum: ['Multiple choice', 'True or False', 'Mixed questions'],
      required: true,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    questions: {
      type: [QuestionItemSchema],
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

QuizSchema.index({ userId: 1, createdAt: -1 });
QuizSchema.index({ userId: 1, difficulty: 1 });

export const QuizModel = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
