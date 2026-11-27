import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnswerRecord {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface IQuizResult extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  answers: IAnswerRecord[];
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

const AnswerRecordSchema = new Schema<IAnswerRecord>(
  {
    questionIndex: { type: Number, required: true, min: 0 },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const QuizResultSchema = new Schema<IQuizResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    answers: {
      type: [AnswerRecordSchema],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

QuizResultSchema.index({ userId: 1, completedAt: -1 });
QuizResultSchema.index({ userId: 1, quizId: 1 });

export const QuizResultModel =
  mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
