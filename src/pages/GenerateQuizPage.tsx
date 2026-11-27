import { ArrowRight, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { extractApiErrorMessage, quizService } from '../services/api.ts';
import { DifficultyLevel, Quiz, QuizQuestionMode } from '../types/index.ts';

interface GenerateQuizPageProps {
  navigate: (to: string) => void;
}

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
const QUESTION_MODES: QuizQuestionMode[] = [
  'Multiple choice',
  'True or False',
  'Mixed questions',
];
const QUESTION_COUNTS = [3, 5, 10, 15];
const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Hindi',
  'Japanese',
  'Chinese',
];

const SUGGESTED_TOPICS = [
  'REST API Design & HTTP Semantics',
  'Cell Biology & Mitosis',
  'Macroeconomics: Monetary Policy',
  'JavaScript Closures & Event Loop',
];

export function GenerateQuizPage({ navigate }: GenerateQuizPageProps) {
  const [topic, setTopic] = useState('');
  const [studyMaterial, setStudyMaterial] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionType, setQuestionType] = useState<QuizQuestionMode>('Multiple choice');
  const [language, setLanguage] = useState('English');

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);

  const runGeneration = async () => {
    setError(null);
    if (topic.trim().length < 2) {
      setError('Please enter a topic or subject (at least 2 characters).');
      return;
    }

    setGenerating(true);
    try {
      const quiz = await quizService.generate({
        topic: topic.trim(),
        studyMaterial: studyMaterial.trim() || undefined,
        numQuestions,
        difficulty,
        questionType,
        language,
      });
      setGeneratedQuiz(quiz);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Unable to generate quiz right now. Please retry.'));
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runGeneration();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[#171717]">
          AI Quiz Generator
        </h2>
        <p className="mt-1 text-sm text-[#737373]">
          Specify your subject and optional reference notes to build a calibrated assessment.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/[0.05] text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}

      {/* Generated Quiz Ready Panel */}
      {generatedQuiz && !generating && (
        <div className="rounded-xl bg-white border border-[#5145CD]/40 p-6 space-y-5 shadow-[0_6px_24px_rgba(81,69,205,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#5145CD]">
                <CheckCircle2 className="h-4 w-4" />
                <span>Quiz generated and saved</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-[#171717]">
                {generatedQuiz.title}
              </h3>
              <p className="text-xs text-[#737373]">
                {generatedQuiz.topic} · {generatedQuiz.difficulty} · {generatedQuiz.questionType} ·{' '}
                {generatedQuiz.totalQuestions} questions · {generatedQuiz.language}
              </p>
            </div>
          </div>

          <div className="border-t border-[#E5E5E3] pt-4 space-y-2">
            <p className="text-xs font-medium text-[#737373]">Preview of generated questions</p>
            <ol className="space-y-2">
              {generatedQuiz.questions.slice(0, 3).map((q, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[#171717] flex items-baseline gap-2.5"
                >
                  <span className="font-mono text-xs text-[#737373] tabular-nums">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span className="line-clamp-1">{q.questionText}</span>
                </li>
              ))}
              {generatedQuiz.questions.length > 3 && (
                <li className="text-xs text-[#737373] pl-7">
                  +{generatedQuiz.questions.length - 3} more questions ready in the assessment
                </li>
              )}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/quiz/${generatedQuiz.id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Start Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={runGeneration}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F8F8F6] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Regenerate Questions</span>
            </button>
          </div>
        </div>
      )}

      {/* Generator Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white border border-[#E5E5E3] p-6 sm:p-7 space-y-6"
      >
        {/* 1. Topic */}
        <div>
          <label htmlFor="quiz-topic" className="block text-sm font-medium text-[#171717] mb-1.5">
            Topic or subject <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="quiz-topic"
            type="text"
            required
            maxLength={200}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., PostgreSQL Indexing & Query Optimization"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15 transition-colors"
          />
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#737373]">Suggestions:</span>
            {SUGGESTED_TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className="text-xs text-[#525252] hover:text-[#5145CD] underline-offset-2 hover:underline transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Optional Study Material */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="quiz-material" className="block text-sm font-medium text-[#171717]">
              Study material or notes <span className="text-xs font-normal text-[#737373]">(optional)</span>
            </label>
            <span className="font-mono text-[11px] text-[#737373] tabular-nums">
              {studyMaterial.length} / 12,000
            </span>
          </div>
          <textarea
            id="quiz-material"
            rows={5}
            maxLength={12000}
            value={studyMaterial}
            onChange={(e) => setStudyMaterial(e.target.value)}
            placeholder="Paste lecture notes, documentation excerpts, or article text to ground the questions directly in your material..."
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15 transition-colors resize-y"
          />
        </div>

        {/* 3 & 4. Number of Questions & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-2">
              Number of questions
            </label>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center p-1 bg-[#F3F3F1] rounded-lg">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setNumQuestions(count)}
                    className={`px-3 py-1.5 font-mono text-xs font-medium rounded-md transition-colors tabular-nums cursor-pointer ${
                      numQuestions === count
                        ? 'bg-white text-[#171717] shadow-xs'
                        : 'text-[#525252] hover:text-[#171717]'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={20}
                aria-label="Custom number of questions"
                value={numQuestions}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val)) {
                    setNumQuestions(Math.min(Math.max(val, 1), 20));
                  }
                }}
                className="w-16 px-2.5 py-1.5 font-mono text-xs text-center bg-white border border-[#E5E5E3] rounded-lg text-[#171717] tabular-nums focus:outline-none focus:border-[#5145CD]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#171717] mb-2">
              Difficulty level
            </label>
            <div className="inline-flex items-center p-1 bg-[#F3F3F1] rounded-lg w-full">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    difficulty === level
                      ? 'bg-white text-[#171717] shadow-xs'
                      : 'text-[#525252] hover:text-[#171717]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5 & 6. Question Type & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-2">
              Question types
            </label>
            <div className="inline-flex items-center p-1 bg-[#F3F3F1] rounded-lg w-full">
              {QUESTION_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setQuestionType(mode)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    questionType === mode
                      ? 'bg-white text-[#171717] shadow-xs'
                      : 'text-[#525252] hover:text-[#171717]'
                  }`}
                >
                  {mode === 'Multiple choice'
                    ? 'MCQ'
                    : mode === 'True or False'
                      ? 'True / False'
                      : 'Mixed'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quiz-language" className="block text-sm font-medium text-[#171717] mb-2">
              Language
            </label>
            <select
              id="quiz-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15 transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5E3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#737373]">
            Generates {numQuestions} {difficulty.toLowerCase()} {questionType.toLowerCase()} in{' '}
            {language}.
          </p>

          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <span>Generate Quiz</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
