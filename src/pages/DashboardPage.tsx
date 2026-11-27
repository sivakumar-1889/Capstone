import { ArrowRight, BookOpen, History, Play, Plus, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { extractApiErrorMessage, quizService, userService } from '../services/api.ts';
import { DashboardStats, Quiz, RecentActivityItem } from '../types/index.ts';

interface DashboardPageProps {
  navigate: (to: string) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [profileData, quizzes] = await Promise.all([
          userService.getProfile(),
          quizService.list(),
        ]);
        if (cancelled) return;
        setStats(profileData.stats);
        setRecentActivity(profileData.recentActivity);
        setRecentQuizzes(quizzes.slice(0, 5));
      } catch (err) {
        if (!cancelled) {
          setError(extractApiErrorMessage(err, 'Unable to load dashboard metrics.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = (user?.name || 'there').split(' ')[0];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E3]">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#171717]">
            Welcome back, {firstName}
          </h2>
          <p className="mt-1 text-sm text-[#737373]">
            Review your recent performance or generate a tailored assessment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/generate')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Generate New Quiz</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/[0.05] text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-[#E5E5E3] p-5">
          <p className="text-xs font-medium text-[#737373]">Total Quizzes Generated</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#171717] tabular-nums">
            {loading ? '—' : (stats?.totalQuizzes ?? 0)}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-[#E5E5E3] p-5">
          <p className="text-xs font-medium text-[#737373]">Total Questions Answered</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#171717] tabular-nums">
            {loading ? '—' : (stats?.totalQuestionsAnswered ?? 0)}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-[#E5E5E3] p-5">
          <p className="text-xs font-medium text-[#737373]">Average Quiz Score</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#171717] tabular-nums">
            {loading ? '—' : `${stats?.averageScore ?? 0}%`}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-[#E5E5E3] p-5">
          <p className="text-xs font-medium text-[#737373]">Completed Attempts</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#171717] tabular-nums">
            {loading ? '—' : (stats?.totalAttempts ?? 0)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/generate')}
          className="text-left rounded-xl bg-white border border-[#E5E5E3] hover:border-[#CFCFCB] p-5 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <Wand2 className="h-4 w-4 text-[#5145CD]" />
            <ArrowRight className="h-4 w-4 text-[#A3A3A3] group-hover:text-[#171717] transition-colors" />
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-[#171717]">
            Create from Topic or Notes
          </h3>
          <p className="mt-1 text-xs text-[#737373]">
            Configure difficulty, question format, and language.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/history')}
          className="text-left rounded-xl bg-white border border-[#E5E5E3] hover:border-[#CFCFCB] p-5 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <History className="h-4 w-4 text-[#5145CD]" />
            <ArrowRight className="h-4 w-4 text-[#A3A3A3] group-hover:text-[#171717] transition-colors" />
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-[#171717]">
            Browse Saved Quizzes
          </h3>
          <p className="mt-1 text-xs text-[#737373]">
            Search by topic, filter difficulty, or retake previous sets.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="text-left rounded-xl bg-white border border-[#E5E5E3] hover:border-[#CFCFCB] p-5 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <BookOpen className="h-4 w-4 text-[#5145CD]" />
            <ArrowRight className="h-4 w-4 text-[#A3A3A3] group-hover:text-[#171717] transition-colors" />
          </div>
          <h3 className="mt-4 font-display text-sm font-semibold text-[#171717]">
            Account &amp; Security
          </h3>
          <p className="mt-1 text-xs text-[#737373]">
            Manage your profile information and password credentials.
          </p>
        </button>
      </div>

      {/* Two-Column Activity & Quiz History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Quiz Activity */}
        <section className="lg:col-span-7 rounded-xl bg-white border border-[#E5E5E3] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5E3] flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-[#171717]">
              Recent Quiz Activity
            </h3>
            {recentActivity.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="text-xs font-medium text-[#5145CD] hover:underline cursor-pointer"
              >
                View all
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 rounded-lg bg-[#F3F3F1] animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-[#171717]">No completed attempts yet</p>
              <p className="mt-1 text-xs text-[#737373]">
                Generate and complete a quiz to see your scores and explanations here.
              </p>
              <button
                type="button"
                onClick={() => navigate('/generate')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
              >
                Generate your first quiz
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E3]">
              {recentActivity.map((item) => (
                <div
                  key={item.resultId}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F8F8F6]/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#171717] truncate">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#737373] truncate">
                      {item.topic} · {item.difficulty} · {formatDate(item.completedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-[#171717] tabular-nums">
                        {item.percentage}%
                      </p>
                      <p className="font-mono text-[11px] text-[#737373] tabular-nums">
                        {item.score}/{item.totalQuestions}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/results/${item.resultId}`)}
                      className="px-3 py-1.5 text-xs font-medium text-[#171717] border border-[#E5E5E3] rounded-md hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Quizzes */}
        <section className="lg:col-span-5 rounded-xl bg-white border border-[#E5E5E3] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5E3] flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-[#171717]">Saved Quizzes</h3>
            {recentQuizzes.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="text-xs font-medium text-[#5145CD] hover:underline cursor-pointer"
              >
                Manage
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 rounded-lg bg-[#F3F3F1] animate-pulse" />
              ))}
            </div>
          ) : recentQuizzes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-[#171717]">Your library is empty</p>
              <p className="mt-1 text-xs text-[#737373]">
                Quizzes you generate are automatically saved here for retakes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E3]">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8F8F6]/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#171717] truncate">{quiz.title}</p>
                    <p className="mt-0.5 text-xs text-[#737373] truncate">
                      {quiz.difficulty} · {quiz.totalQuestions} questions
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5145CD] bg-[#5145CD]/[0.07] hover:bg-[#5145CD]/12 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="h-3 w-3" />
                    <span>{quiz.latestResult ? 'Retake' : 'Start'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
