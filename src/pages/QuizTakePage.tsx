import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import { extractApiErrorMessage, quizService, resultService } from '../services/api.ts';
import { Quiz } from '../types/index.ts';

interface QuizTakePageProps {
  quizId: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

export function QuizTakePage({ quizId, navigate }: QuizTakePageProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadQuiz() {
      setLoading(true);
      setError(null);
      try {
        const fetched = await quizService.getById(quizId);
        if (!cancelled) {
          setQuiz(fetched);
          setCurrentIndex(0);
          setSelectedAnswers({});
        }
      } catch (err) {
        if (!cancelled) {
          setError(extractApiErrorMessage(err, 'Unable to load this quiz.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadQuiz();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-[#737373]">
          <Loader2 className="h-4 w-4 animate-spin text-[#5145CD]" />
          <span>Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl bg-white border border-[#E5E5E3] p-6 text-center space-y-4">
          <p className="font-display text-base font-semibold text-[#171717]">
            {error || 'Quiz not found'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="px-4 py-2 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
          >
            Back to Quiz History
          </button>
        </div>
      </div>
    );
  }

  const total = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);
  const currentSelection = selectedAnswers[currentIndex] || '';

  const handleSelectOption = (option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const answersPayload = quiz.questions.map((_, idx) => ({
        questionIndex: idx,
        selectedAnswer: selectedAnswers[idx] || '',
      }));
      const res = await resultService.submit({
        quizId: quiz.id,
        answers: answersPayload,
      });
      setConfirmOpen(false);
      navigate(`/results/${res.result.id}`, { replace: true });
    } catch (err) {
      setSubmitError(extractApiErrorMessage(err, 'Failed to submit quiz. Please try again.'));
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#171717] flex flex-col">
      {/* Minimal Distraction-Free Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E5E3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#171717] truncate">{quiz.title}</p>
            <p className="text-xs text-[#737373] truncate">
              {quiz.topic} · {quiz.difficulty}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="font-mono text-xs text-[#525252] tabular-nums">
              Question {currentIndex + 1} of {total}
            </span>
            <button
              type="button"
              onClick={() => navigate('/history')}
              aria-label="Exit quiz"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#525252] hover:text-[#171717] border border-[#E5E5E3] rounded-lg hover:bg-[#F8F8F6] transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Hairline Progress Bar */}
        <div className="h-[2px] w-full bg-[#EFEFED]">
          <div
            className="h-full bg-[#5145CD] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Question Viewport */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-between gap-8">
        <div className="space-y-6">
          {submitError && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/[0.05] text-sm text-[#B91C1C]"
            >
              {submitError}
            </div>
          )}

          {/* Question Stepper Strip */}
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Question navigator">
            {quiz.questions.map((_, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = Boolean(selectedAnswers[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to question ${idx + 1}`}
                  className={`h-7 min-w-7 px-2 rounded-md font-mono text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#5145CD] text-white'
                      : isAnswered
                        ? 'bg-white border border-[#5145CD]/40 text-[#5145CD]'
                        : 'bg-white border border-[#E5E5E3] text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl bg-white border border-[#E5E5E3] p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between gap-4 text-xs text-[#737373]">
                <span className="font-mono tabular-nums">
                  Question {String(currentIndex + 1).padStart(2, '0')}
                </span>
                <span>
                  {currentQuestion.type === 'true-false' ? 'True or False' : 'Multiple choice'}
                </span>
              </div>

              <h2 className="font-display text-lg sm:text-xl font-medium text-[#171717] leading-snug">
                {currentQuestion.questionText}
              </h2>

              <div className="space-y-3" role="radiogroup" aria-label="Answer choices">
                {currentQuestion.options.map((option, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = currentSelection === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-lg border text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5145CD]/40 ${
                        isSelected
                          ? 'border-[#5145CD] bg-[#5145CD]/[0.05]'
                          : 'border-[#E5E5E3] bg-white hover:border-[#CFCFCB] hover:bg-[#F8F8F6]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className={`font-mono text-xs w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#5145CD] text-white'
                              : 'bg-[#F3F3F1] text-[#525252]'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm sm:text-[15px] font-medium text-[#171717]">
                          {option}
                        </span>
                      </div>

                      {isSelected && <Check className="h-4 w-4 text-[#5145CD] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E5E5E3]">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F3F3F1] rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < total - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F3F3F1] rounded-lg transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
            >
              <span>Submit Quiz</span>
            </button>
          </div>
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        title="Submit quiz for grading?"
        description={
          answeredCount < total
            ? `You have answered ${answeredCount} of ${total} questions. Unanswered questions will be marked incorrect.`
            : `You have answered all ${total} questions. Ready to calculate your score and view explanations?`
        }
        confirmLabel="Submit Quiz"
        cancelLabel="Review Answers"
        loading={submitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
