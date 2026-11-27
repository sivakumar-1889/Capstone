import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Logo } from '../components/Logo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { extractApiErrorMessage } from '../services/api.ts';

interface AuthPageProps {
  mode: 'login' | 'register';
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

export function AuthPage({ mode, navigate }: AuthPageProps) {
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister && name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Authentication failed. Please check your credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#171717] flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <Logo onClick={() => navigate('/')} />
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to home</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-10">
        <div className="rounded-xl bg-white border border-[#E5E5E3] p-6 sm:p-8 shadow-[0_4px_20px_rgba(23,23,23,0.03)]">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#171717]">
              {isRegister ? 'Create your account' : 'Sign in to Quizora'}
            </h1>
            <p className="mt-1.5 text-sm text-[#737373]">
              {isRegister
                ? 'Start generating structured quizzes and tracking your mastery.'
                : 'Welcome back. Enter your credentials to open your workspace.'}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 px-3.5 py-2.5 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/[0.05] text-xs sm:text-sm text-[#B91C1C]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isRegister && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-[#171717] mb-1.5">
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15 transition-colors"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-[#171717] mb-1.5">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-[#171717] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#E5E5E3] rounded-lg text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#5145CD] focus:ring-2 focus:ring-[#5145CD]/15 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#737373] hover:text-[#171717] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting
                ? isRegister
                  ? 'Creating account...'
                  : 'Signing in...'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E5E3] text-center text-xs text-[#737373]">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    navigate('/login');
                  }}
                  className="font-medium text-[#5145CD] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Quizora?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    navigate('/register');
                  }}
                  className="font-medium text-[#5145CD] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[#737373] pb-2">
        Quizora · Turn what you know into what you can prove.
      </p>
    </div>
  );
}
