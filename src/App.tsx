import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { useRoute } from './hooks/useRoute.ts';
import { AppLayout } from './layouts/AppLayout.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { GenerateQuizPage } from './pages/GenerateQuizPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { QuizResultPage } from './pages/QuizResultPage.tsx';
import { QuizTakePage } from './pages/QuizTakePage.tsx';

function AppRoutes() {
  const { user, loading } = useAuth();
  const { pathname, navigate } = useRoute();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPath =
    pathname === '/dashboard' ||
    pathname === '/generate' ||
    pathname === '/history' ||
    pathname === '/profile' ||
    pathname.startsWith('/quiz/') ||
    pathname.startsWith('/results/');

  useEffect(() => {
    if (loading) return;
    if (isProtectedPath && !user) {
      navigate('/login', { replace: true });
    } else if (isAuthPage && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, isProtectedPath, isAuthPage, user, navigate]);

  if (loading && (isProtectedPath || isAuthPage)) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm text-[#737373]">
          <Loader2 className="h-4 w-4 animate-spin text-[#5145CD]" />
          <span>Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (pathname === '/') {
    return <LandingPage navigate={navigate} />;
  }

  if (pathname === '/login') {
    return <AuthPage mode="login" navigate={navigate} />;
  }

  if (pathname === '/register') {
    return <AuthPage mode="register" navigate={navigate} />;
  }

  if (!user) {
    return <AuthPage mode="login" navigate={navigate} />;
  }

  if (pathname.startsWith('/quiz/')) {
    const quizId = pathname.slice('/quiz/'.length);
    return <QuizTakePage quizId={quizId} navigate={navigate} />;
  }

  if (pathname === '/dashboard') {
    return (
      <AppLayout
        currentPath={pathname}
        pageTitle="Overview"
        pageSubtitle="Performance summary and recent activity"
        navigate={navigate}
      >
        <DashboardPage navigate={navigate} />
      </AppLayout>
    );
  }

  if (pathname === '/generate') {
    return (
      <AppLayout
        currentPath={pathname}
        pageTitle="Generate Quiz"
        pageSubtitle="Configure AI assessment parameters"
        navigate={navigate}
      >
        <GenerateQuizPage navigate={navigate} />
      </AppLayout>
    );
  }

  if (pathname === '/history') {
    return (
      <AppLayout
        currentPath={pathname}
        pageTitle="Quiz History"
        pageSubtitle="Saved assessments and graded results"
        navigate={navigate}
      >
        <HistoryPage navigate={navigate} />
      </AppLayout>
    );
  }

  if (pathname.startsWith('/results/')) {
    const resultId = pathname.slice('/results/'.length);
    return (
      <AppLayout
        currentPath={pathname}
        pageTitle="Quiz Review"
        pageSubtitle="Score breakdown and answer explanations"
        navigate={navigate}
      >
        <QuizResultPage resultId={resultId} navigate={navigate} />
      </AppLayout>
    );
  }

  if (pathname === '/profile') {
    return (
      <AppLayout
        currentPath={pathname}
        pageTitle="Profile & Settings"
        pageSubtitle="Account credentials and preferences"
        navigate={navigate}
      >
        <ProfilePage navigate={navigate} />
      </AppLayout>
    );
  }

  return <LandingPage navigate={navigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
