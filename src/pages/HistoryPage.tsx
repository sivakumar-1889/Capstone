import { Eye, Play, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import { extractApiErrorMessage, quizService, resultService } from '../services/api.ts';
import { DifficultyLevel, Quiz, QuizResult } from '../types/index.ts';

interface HistoryPageProps {
  navigate: (to: string) => void;
}

const DIFFICULTY_FILTERS: Array<DifficultyLevel | 'All'> = ['All', 'Easy', 'Medium', 'Hard'];

export function HistoryPage({ navigate }: HistoryPageProps) {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'results'>('quizzes');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'All'>('All');

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [quizList, resultList] = await Promise.all([
        quizService.list({
          search: search.trim() || undefined,
          difficulty,
        }),
        resultService.list(),
      ]);
      setQuizzes(quizList);
      setResults(resultList);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to load quiz history.'));
    } finally {
      setLoading(false);
    }
  }, [search, difficulty]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    setDeleting(true);
    try {
      await quizService.remove(quizToDelete.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizToDelete.id));
      setResults((prev) => prev.filter((r) => r.quizId !== quizToDelete.id));
      setQuizToDelete(null);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Could not delete quiz.'));
      setQuizToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const filteredResults = results.filter((r) => {
    const matchesDifficulty =
      difficulty === 'All' || (r.quizDifficulty || 'Medium') === difficulty;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (r.quizTitle || '').toLowerCase().includes(term) ||
      (r.quizTopic || '').toLowerCase().includes(term);
    return matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#171717]">
            Quiz History
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            Open saved assessments, review past results, or remove older quizzes.
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex items-center p-1 bg-[#EAEAE6] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-white text-[#171717] shadow-xs'
                : 'text-[#525252] hover:text-[#171717]'
            }`}
          >
            Saved Quizzes ({quizzes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'results'
                ? 'bg-white text-[#171717] shadow-xs'
                : 'text-[#525252] hover:text-[#171717]'
            }`}
          >
            Completed Results ({filteredResults.length})
          </button>
        </div>
      </div>

      {/* Search & Difficulty Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic or title..."
            aria-label="Search quizzes by topic"
            className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15 transition-colors"
          />
        </div>

        <div className="inline-flex items-center p-1 bg-[#EAEAE6] rounded-lg self-start sm:self-auto">
          {DIFFICULTY_FILTERS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
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

      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/[0.05] text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}

      {/* List Viewport */}
      <div className="rounded-xl bg-white border border-[#E5E5E3] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-14 rounded-lg bg-[#F3F3F1] animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'quizzes' ? (
          quizzes.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-medium text-[#171717]">
                {search || difficulty !== 'All'
                  ? 'No quizzes match your current filters'
                  : 'No saved quizzes yet'}
              </p>
              <p className="text-xs text-[#737373]">
                {search || difficulty !== 'All'
                  ? 'Try clearing your search query or switching the difficulty filter.'
                  : 'Generate your first AI quiz to start building your study library.'}
              </p>
              {!search && difficulty === 'All' && (
                <button
                  type="button"
                  onClick={() => navigate('/generate')}
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-xs font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Generate Quiz</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E3]">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F8F6]/60 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-semibold text-[#171717] truncate">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-[#737373] truncate">
                      {quiz.topic} · {quiz.difficulty} · {quiz.totalQuestions} questions ·{' '}
                      {quiz.language} · {formatDate(quiz.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {quiz.latestResult && (
                      <button
                        type="button"
                        onClick={() => navigate(`/results/${quiz.latestResult!.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F8F8F6] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#737373]" />
                        <span className="tabular-nums">
                          Last: {quiz.latestResult.percentage}%
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      <span>{quiz.latestResult ? 'Retake' : 'Take Quiz'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuizToDelete(quiz)}
                      aria-label={`Delete ${quiz.title}`}
                      className="p-1.5 text-[#737373] hover:text-[#DC2626] hover:bg-[#DC2626]/[0.06] rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredResults.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-medium text-[#171717]">No completed quiz attempts found</p>
            <p className="text-xs text-[#737373]">
              Complete any quiz to view your graded score and answer explanations.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E3]">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F8F6]/60 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold text-[#171717] truncate">
                    {result.quizTitle}
                  </h3>
                  <p className="text-xs text-[#737373] truncate">
                    {result.quizTopic} · {result.quizDifficulty} · Completed{' '}
                    {formatDate(result.completedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-sm font-semibold text-[#171717] tabular-nums">
                      {result.percentage}%
                    </p>
                    <p className="font-mono text-[11px] text-[#737373] tabular-nums">
                      {result.score} / {result.totalQuestions} correct
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/results/${result.id}`)}
                    className="px-3 py-1.5 text-xs font-medium text-[#171717] border border-[#E5E5E3] hover:bg-white rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(quizToDelete)}
        title="Delete saved quiz?"
        description={`"${quizToDelete?.title || ''}" and its associated attempt history will be permanently removed.`}
        confirmLabel="Delete Quiz"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setQuizToDelete(null)}
      />
    </div>
  );
}
