import { motion } from 'framer-motion';
import { ArrowRight, Check, CheckCircle2, FileText, Layers, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../components/Logo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface LandingPageProps {
  navigate: (to: string) => void;
}

const PREVIEW_QUESTION = {
  topic: 'Distributed Systems',
  difficulty: 'Medium',
  questionNumber: '02',
  totalQuestions: '05',
  prompt:
    'In a Raft consensus cluster of 5 nodes, what is the maximum number of node failures the cluster can tolerate while still committing new log entries?',
  options: [
    '1 node failure',
    '2 node failures',
    '3 node failures',
    '4 node failures',
  ],
  correctAnswer: '2 node failures',
  explanation:
    'Raft requires a strict majority quorum (⌊N/2⌋ + 1). For 5 nodes, a quorum is 3 nodes, allowing up to 2 nodes to fail without losing availability.',
};

export function LandingPage({ navigate }: LandingPageProps) {
  const { user } = useAuth();
  const [previewSelected, setPreviewSelected] = useState<string | null>('2 node failures');

  const handlePrimaryCta = () => {
    navigate(user ? '/generate' : '/register');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#171717]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#F8F8F6]/90 backdrop-blur-md border-b border-[#E5E5E3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <Logo onClick={() => navigate('/')} />

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#525252]"
          >
            <a
              href="#features"
              className="hover:text-[#171717] transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#171717] transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="hover:text-[#171717] transition-colors whitespace-nowrap shrink-0"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 text-sm font-medium text-[#525252] hover:text-[#171717] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-14 sm:pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <p className="text-xs font-medium tracking-wide text-[#5145CD]">
              Quizora · Turn what you know into what you can prove.
            </p>

            <h1
              className="font-display font-semibold tracking-tight text-[#171717] leading-[1.08]"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
            >
              A better way to prepare, practice and perform.
            </h1>

            <p className="text-base sm:text-lg text-[#525252] leading-relaxed max-w-xl">
              Generate structured, difficulty-calibrated quizzes from any subject or study document
              in seconds. Practice in a distraction-free workspace, verify every answer with clear
              explanations, and track retention over time.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Generate your first quiz</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F3F3F1] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Explore features
              </a>
            </div>

            <div className="pt-4 border-t border-[#E5E5E3] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#737373]">
              <span>Multiple choice &amp; True/False</span>
              <span aria-hidden="true">·</span>
              <span>Source material grounding</span>
              <span aria-hidden="true">·</span>
              <span>Saved score history</span>
            </div>
          </motion.div>

          {/* Interactive Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="rounded-xl bg-white border border-[#E5E5E3] shadow-[0_8px_30px_rgba(23,23,23,0.05)] overflow-hidden">
              {/* Preview Window Bar */}
              <div className="px-5 py-3.5 border-b border-[#E5E5E3] flex items-center justify-between gap-4 bg-[#FCFCFB]">
                <div className="flex items-center gap-2 text-xs text-[#737373] truncate">
                  <span className="font-medium text-[#171717]">{PREVIEW_QUESTION.topic}</span>
                  <span aria-hidden="true">·</span>
                  <span>{PREVIEW_QUESTION.difficulty}</span>
                </div>
                <span className="font-mono text-xs text-[#737373] tabular-nums shrink-0">
                  {PREVIEW_QUESTION.questionNumber} / {PREVIEW_QUESTION.totalQuestions}
                </span>
              </div>

              {/* Hairline progress bar */}
              <div className="h-[2px] w-full bg-[#EFEFED]">
                <div className="h-full w-2/5 bg-[#5145CD]" />
              </div>

              <div className="p-6 space-y-5">
                <p className="font-display text-base sm:text-[17px] font-medium text-[#171717] leading-snug">
                  {PREVIEW_QUESTION.prompt}
                </p>

                <div className="space-y-2.5">
                  {PREVIEW_QUESTION.options.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = previewSelected === option;
                    const isCorrect = option === PREVIEW_QUESTION.correctAnswer;

                    let borderClass = 'border-[#E5E5E3] hover:border-[#CFCFCB] bg-white';
                    if (isSelected && isCorrect) {
                      borderClass = 'border-[#5145CD] bg-[#5145CD]/[0.04]';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-[#DC2626] bg-[#DC2626]/[0.04]';
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPreviewSelected(option)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-colors cursor-pointer ${borderClass}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`font-mono text-xs w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-[#5145CD] text-white'
                                  : 'bg-[#DC2626] text-white'
                                : 'bg-[#F3F3F1] text-[#525252]'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-[#171717] font-medium">{option}</span>
                        </div>
                        {isSelected && (
                          <span
                            className={`text-xs font-medium shrink-0 ${
                              isCorrect ? 'text-[#5145CD]' : 'text-[#DC2626]'
                            }`}
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {previewSelected && (
                  <div className="pt-4 border-t border-[#E5E5E3] text-xs sm:text-sm text-[#525252] leading-relaxed">
                    <span className="font-medium text-[#171717]">Explanation: </span>
                    {PREVIEW_QUESTION.explanation}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Section */}
      <section id="features" className="border-t border-[#E5E5E3] bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-medium text-[#5145CD] mb-2">Capabilities</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
              Built for focused recall, not passive reading.
            </h2>
            <p className="mt-3 text-base text-[#525252]">
              Every part of Quizora removes friction between studying material and verifying that
              you actually retain it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 rounded-xl border border-[#E5E5E3] bg-[#F8F8F6]/50 p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="font-mono text-xs text-[#737373]">01</span>
                  <SlidersHorizontal className="h-4 w-4 text-[#5145CD]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#171717]">
                  Calibrated AI Quiz Architecture
                </h3>
                <p className="mt-2 text-sm text-[#525252] leading-relaxed max-w-xl">
                  Control question count, difficulty tier (Easy, Medium, Hard), question format
                  (Multiple Choice, True/False, or Mixed), and output language. Every prompt
                  enforces structured validation so choices never duplicate or contradict.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E5E3] flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#737373]">
                <span>1 to 20 questions per set</span>
                <span aria-hidden="true">·</span>
                <span>8 supported languages</span>
                <span aria-hidden="true">·</span>
                <span>One-click regeneration</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E5E3] bg-white p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="font-mono text-xs text-[#737373]">02</span>
                  <FileText className="h-4 w-4 text-[#5145CD]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#171717]">
                  Source-Material Grounding
                </h3>
                <p className="mt-2 text-sm text-[#525252] leading-relaxed">
                  Paste lecture transcripts, technical documentation, or textbook chapters to test
                  exact definitions and edge cases from your own notes.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E5E3] bg-white p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="font-mono text-xs text-[#737373]">03</span>
                  <CheckCircle2 className="h-4 w-4 text-[#5145CD]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#171717]">
                  Distraction-Free Assessment
                </h3>
                <p className="mt-2 text-sm text-[#525252] leading-relaxed">
                  Work through one question at a time with keyboard-ready controls, question
                  navigation, and a confirmation check before scoring.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-[#E5E5E3] bg-[#F8F8F6]/50 p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="font-mono text-xs text-[#737373]">04</span>
                  <Layers className="h-4 w-4 text-[#5145CD]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#171717]">
                  Detailed Answer Review &amp; Attempt History
                </h3>
                <p className="mt-2 text-sm text-[#525252] leading-relaxed max-w-xl">
                  Every completed quiz records your answers, percentage score, and question-by-question
                  explanations. Search saved quizzes by topic, filter by difficulty, and retake
                  assessments to measure progress.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E5E3] flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#737373]">
                <span>Server-verified grading</span>
                <span aria-hidden="true">·</span>
                <span>Topic search &amp; difficulty filters</span>
                <span aria-hidden="true">·</span>
                <span>Unlimited retakes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-[#E5E5E3] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-medium text-[#5145CD] mb-2">Workflow</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
              From study notes to verified mastery in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="font-mono text-xs font-medium text-[#5145CD]">01. Configure</div>
              <h3 className="font-display text-lg font-semibold text-[#171717]">
                Define your topic or paste notes
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed">
                Enter any academic, technical, or professional subject—or paste raw study material—and
                pick your question count, difficulty, and language.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-xs font-medium text-[#5145CD]">02. Practice</div>
              <h3 className="font-display text-lg font-semibold text-[#171717]">
                Complete the focused quiz
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed">
                Step through one question at a time, move freely between prompts, track answered
                progress, and submit when ready.
              </p>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-xs font-medium text-[#5145CD]">03. Review</div>
              <h3 className="font-display text-lg font-semibold text-[#171717]">
                Inspect explanations and retake
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed">
                See exact correct and incorrect answers paired with concise reasoning, then revisit
                or retake any quiz from your history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-[#E5E5E3] bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-medium text-[#5145CD] mb-2">Pricing</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#171717]">
              Straightforward plans for individual learners and study cohorts.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="rounded-xl border border-[#E5E5E3] bg-[#F8F8F6]/40 p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold text-[#171717]">
                    For individual learners
                  </h3>
                  <span className="font-mono text-xl font-semibold text-[#171717] tabular-nums">
                    $0
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#525252]">
                  Everything required for daily exam prep, self-testing, and topic review.
                </p>

                <ul className="mt-6 space-y-3 border-t border-[#E5E5E3] pt-5 text-sm text-[#171717]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#5145CD] shrink-0" />
                    <span>AI quiz generation up to 20 questions per set</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#5145CD] shrink-0" />
                    <span>Custom study material context up to 12,000 characters</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#5145CD] shrink-0" />
                    <span>Full quiz history, search, and unlimited retakes</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handlePrimaryCta}
                className="mt-8 w-full px-4 py-2.5 text-sm font-medium text-[#171717] bg-white border border-[#E5E5E3] hover:bg-[#F3F3F1] rounded-lg transition-colors cursor-pointer"
              >
                Start for free
              </button>
            </div>

            <div className="rounded-xl border border-[#5145CD]/40 bg-white p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold text-[#171717]">
                    For study teams &amp; educators
                  </h3>
                  <span className="font-mono text-xl font-semibold text-[#171717] tabular-nums">
                    $12<span className="text-xs font-normal text-[#737373]">/mo</span>
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#525252]">
                  Extended document capacity and higher generation throughput for intensive prep.
                </p>

                <ul className="mt-6 space-y-3 border-t border-[#E5E5E3] pt-5 text-sm text-[#171717]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#5145CD] shrink-0" />
                    <span>Priority Gemini generation throughput</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#5145CD] shrink-0" />
                    <span>Multi-language assessments across 8 languages</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-[#5145CD] shrink-0" />
                    <span>Longitudinal score tracking and review archive</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handlePrimaryCta}
                className="mt-8 w-full px-4 py-2.5 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
              >
                Get Started with Quizora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#E5E5E3] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-5">
          <h2
            className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[#171717]"
            style={{ textWrap: 'balance' }}
          >
            Turn what you know into what you can prove.
          </h2>
          <p className="text-base text-[#525252] max-w-xl mx-auto">
            Create an account in seconds and generate your first tailored assessment right away.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#5145CD] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
            >
              <span>Generate your first quiz</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E3] bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <Logo onClick={() => navigate('/')} size="sm" />
            <p className="text-xs text-[#737373]">
              Turn what you know into what you can prove.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#737373]">
            <a href="#features" className="hover:text-[#171717] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#171717] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#171717] transition-colors">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:text-[#171717] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <span>&copy; {new Date().getFullYear()} Quizora</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
