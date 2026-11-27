import { ArrowLeft, CheckCircle2, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { extractApiErrorMessage, resultService } from '../services/api.ts';
import { Quiz, QuizResult } from '../types/index.ts';

interface QuizResultPageProps {
  resultId: string;
  navigate: (to: string) => void;
}

export function QuizResultPage({ resultId, navigate }: QuizResultPageProps) {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadResult() {
      setLoading(true);
      setError(null);
      try {
        const data = await resultService.getById(resultId);
        if (!cancelled) {
          setResult(data.result);
          setQuiz(data.quiz);
        }
      } catch (err) {
        if (!cancelled) {
          setError(extractApiErrorMessage(err, 'Unable to load quiz result.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadResult();
    return () => {
      cancelled = true;
    };
  }, [resultId]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center gap-3 text-sm text-[#737373]">
        <Loader2 className="h-4 w-4 animate-spin text-[#5145CD]" />
        <span>Loading quiz review...</span>
      </div>
    );
  }

  if (error || !result || !quiz) {
    return (
      <div className="rounded-xl bg-white border border-[#E5E5E3] p-8 text-center space-y-4">
        <p className="font-display text-base font-semibold text-[#171717]">
          {error || 'Result not found'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="px-4 py-2 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
        >
          Back to Quiz History
        </button>
      </div>
    );
  }

  const incorrectCount = result.totalQuestions - result.score;
  const completedDate = new Date(result.completedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Quiz History</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/quiz/${quiz.id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Quiz</span>
          </button>
        </div>
      </div>

      {/* Summary Panel */}
      <section className="rounded-xl bg-white border border-[#E5E5E3] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#171717]">
              {quiz.title}
            </h2>
            <p className="mt-1 text-xs text-[#737373]">
              {quiz.topic} · {quiz.difficulty} · Completed {completedDate}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <p className="font-mono text-3xl font-semibold text-[#5145CD] tabular-nums">
              {result.percentage}%
            </p>
            <p className="text-xs text-[#737373]">Final Score</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#E5E5E3]">
          <div>
            <p className="text-xs text-[#737373]">Total Score</p>
            <p className="mt-1 font-mono text-lg font-semibold text-[#171717] tabular-nums">
              {result.score} / {result.totalQuestions}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#737373]">Correct Answers</p>
            <p className="mt-1 font-mono text-lg font-semibold text-[#16A34A] tabular-nums">
              {result.score}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#737373]">Incorrect Answers</p>
            <p className="mt-1 font-mono text-lg font-semibold text-[#DC2626] tabular-nums">
              {incorrectCount}
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Question Review */}
      <section className="space-y-4">
        <h3 className="font-display text-base font-semibold text-[#171717]">
          Question-by-Question Review
        </h3>

        <div className="space-y-4">
          {quiz.questions.map((question, idx) => {
            const answerRecord = result.answers.find((a) => a.questionIndex === idx);
            const selected = answerRecord?.selectedAnswer || 'Unanswered';
            const isCorrect = Boolean(answerRecord?.isCorrect);

            return (
              <div
                key={idx}
                className="rounded-xl bg-white border border-[#E5E5E3] p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-[#737373] tabular-nums">
                    Question {String(idx + 1).padStart(2, '0')}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      isCorrect ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="font-display text-base font-medium text-[#171717] leading-snug">
                  {question.questionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {question.options.map((opt) => {
                    const isUserChoice =
                      opt.trim().toLowerCase() === selected.trim().toLowerCase();
                    const isAnswerKey =
                      opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

                    let optionStyle = 'border-[#E5E5E3] bg-[#F8F8F6]/50 text-[#525252]';
                    if (isAnswerKey) {
                      optionStyle = 'border-[#16A34A]/50 bg-[#16A34A]/[0.05] text-[#171717]';
                    } else if (isUserChoice && !isAnswerKey) {
                      optionStyle = 'border-[#DC2626]/50 bg-[#DC2626]/[0.05] text-[#171717]';
                    }

                    return (
                      <div
                        key={opt}
                        className={`px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between gap-2 ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerKey && (
                          <span className="text-[11px] font-medium text-[#16A34A] shrink-0">
                            Correct answer
                          </span>
                        )}
                        {isUserChoice && !isAnswerKey && (
                          <span className="text-[11px] font-medium text-[#DC2626] shrink-0">
                            Your choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selected === 'Unanswered' && (
                  <p className="text-xs text-[#DC2626]">No answer was selected for this question.</p>
                )}

                <div className="pt-3 border-t border-[#E5E5E3] text-xs sm:text-sm text-[#525252] leading-relaxed">
                  <span className="font-medium text-[#171717]">Explanation: </span>
                  {question.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
