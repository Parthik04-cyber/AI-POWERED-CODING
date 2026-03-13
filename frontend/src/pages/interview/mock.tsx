'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import {
  createSession,
  getRandomQuestions,
  persistSession,
  generateAIFeedback,
  generateReport,
  getInterviewerGreeting,
  getFollowUpMessage,
  getHintMessage,
  getEncouragementMessage,
  incrementStreak,
} from '@/services/interviewService';
import {
  InterviewSession,
  InterviewQuestion,
  AIMessage,
  QuestionAttempt,
  MOCK_QUESTIONS,
} from '@/types/interview';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'typescript'];

const CODE_TEMPLATES: Record<string, string> = {
  javascript: '// Write your solution here\nfunction solution(nums, target) {\n  // TODO: implement\n}\n',
  python: '# Write your solution here\ndef solution(nums, target):\n    # TODO: implement\n    pass\n',
  java: 'class Solution {\n    public int[] solution(int[] nums, int target) {\n        // TODO: implement\n        return new int[]{};\n    }\n}\n',
  cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // TODO: implement\n        return {};\n    }\n};\n',
  typescript: '// Write your solution here\nfunction solution(nums: number[], target: number): number[] {\n  // TODO: implement\n  return [];\n}\n',
};

type Phase = 'setup' | 'interviewing' | 'feedback' | 'complete';

// ─── Timer Display ────────────────────────────────────────────────────────────
const Timer: React.FC<{
  totalSeconds: number;
  limitMinutes: number;
  isPaused: boolean;
}> = ({ totalSeconds, limitMinutes, isPaused }) => {
  const limitSecs = limitMinutes * 60;
  const remaining = Math.max(0, limitSecs - totalSeconds);
  const pct = Math.min(100, (totalSeconds / limitSecs) * 100);
  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const isWarning = remaining < 120;
  const isDanger = remaining < 60;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold transition-colors duration-300 ${
      isDanger
        ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
        : isWarning
          ? 'bg-amber-50 border-amber-200 text-amber-600'
          : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
      {isPaused ? (
        <span className="text-slate-400">Paused</span>
      ) : (
        <span>{mins}:{secs}</span>
      )}
      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Question Panel ───────────────────────────────────────────────────────────
const QuestionPanel: React.FC<{
  question: InterviewQuestion;
  questionIndex: number;
  totalQuestions: number;
  hintsUsed: number;
  onHint: () => void;
  aiMessages: AIMessage[];
  userMessage: string;
  onUserMessage: (msg: string) => void;
  onSendMessage: () => void;
}> = ({ question, questionIndex, totalQuestions, hintsUsed, onHint, aiMessages, userMessage, onUserMessage, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const diffColor: Record<string, string> = {
    Easy: 'text-emerald-600 bg-emerald-50',
    Medium: 'text-amber-600 bg-amber-50',
    Hard: 'text-red-500 bg-red-50',
  };

  const [tab, setTab] = useState<'problem' | 'chat' | 'hints'>('problem');

  return (
    <div className="flex flex-col h-full">
      {/* Question header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
          <span>Question {questionIndex + 1}/{totalQuestions}</span>
          <span>·</span>
          <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${diffColor[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span>·</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{question.category}</span>
        </div>
        <h2 className="font-bold text-slate-900 text-base">{question.title}</h2>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-100 flex-shrink-0">
        {(['problem', 'chat', 'hints'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 text-xs font-semibold capitalize transition-colors duration-150 ${
              tab === t
                ? 'text-accent border-b-2 border-accent bg-blue-50/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'chat' ? '🤖 AI Interviewer' : t === 'hints' ? `💡 Hints (${hintsUsed}/${question.hints.length})` : '📄 Problem'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'problem' && (
          <div className="px-4 py-4 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p className="whitespace-pre-wrap">{question.description}</p>

            {question.exampleTestCases.length > 0 && (
              <div>
                <p className="font-semibold text-slate-800 mb-2">Examples</p>
                {question.exampleTestCases.map((ex, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 font-mono text-xs mb-2 space-y-1 border border-slate-100">
                    <p><span className="text-slate-400">Input: </span>{ex.input}</p>
                    <p><span className="text-slate-400">Output: </span>{ex.output}</p>
                    {ex.explanation && <p><span className="text-slate-400">Explanation: </span>{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {question.constraints.length > 0 && (
              <div>
                <p className="font-semibold text-slate-800 mb-2">Constraints</p>
                <ul className="space-y-1">
                  {question.constraints.map((c, i) => (
                    <li key={i} className="text-xs text-slate-500 font-mono flex items-start gap-1.5">
                      <span className="text-slate-300 mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {question.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    msg.role === 'interviewer' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {msg.role === 'interviewer' ? '🤖' : '👤'}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-tr-none'
                      : msg.type === 'hint'
                        ? 'bg-amber-50 text-amber-800 border border-amber-100 rounded-tl-none'
                        : 'bg-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-3 py-2 border-t border-slate-100 flex gap-2 flex-shrink-0">
              <input
                type="text"
                placeholder="Reply to interviewer..."
                value={userMessage}
                onChange={(e) => onUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                className="flex-1 h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-accent"
              />
              <button
                onClick={onSendMessage}
                disabled={!userMessage.trim()}
                className="h-8 px-3 bg-accent text-white text-xs rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors duration-150"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {tab === 'hints' && (
          <div className="px-4 py-4 space-y-3">
            {question.hints.map((hint, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 text-sm transition-all duration-300 ${
                  i < hintsUsed
                    ? 'bg-amber-50 border-amber-100 text-amber-800'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                {i < hintsUsed ? (
                  <p><span className="font-semibold mr-1">💡 Hint {i + 1}:</span>{hint}</p>
                ) : (
                  <p className="italic">Hint {i + 1} — locked</p>
                )}
              </div>
            ))}
            {hintsUsed < question.hints.length && (
              <button
                onClick={onHint}
                className="w-full py-2 border border-dashed border-amber-300 text-amber-600 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors duration-150"
              >
                Reveal Next Hint (−5 pts)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MockInterview() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [userMessage, setUserMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<QuestionAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup options
  const [questionCount, setQuestionCount] = useState(3);
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [showRecordingSetup, setShowRecordingSetup] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [showResumeField, setShowResumeField] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = session?.questions[session.currentQuestionIndex];

  // ─── Timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'interviewing' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setQuestionElapsed((s) => s + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, isPaused]);

  // ─── Start interview ─────────────────────────────────────────────────
  const handleStart = () => {
    const questions = getRandomQuestions(
      questionCount,
      filterDifficulty as any || undefined,
      undefined,
      undefined
    );
    const newSession = createSession('mock', questions);
    newSession.isRecording = isRecording;
    newSession.status = 'in_progress';
    newSession.startTime = new Date();

    // AI greeting
    const greeting = getInterviewerGreeting(questions[0]);
    newSession.aiMessages = [greeting];

    setSession(newSession);
    persistSession(newSession);
    setCode(CODE_TEMPLATES[language]);
    setHintsUsed(0);
    setUserMessage('');
    setElapsedSeconds(0);
    setQuestionElapsed(0);
    setPhase('interviewing');
  };

  // ─── Submit current answer ────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!session || !currentQuestion) return;
    setIsSubmitting(true);

    const feedback = generateAIFeedback(currentQuestion, code, questionElapsed);
    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      question: currentQuestion,
      code,
      language,
      timeTaken: questionElapsed,
      status: feedback.overallScore >= 60 ? 'solved' : 'attempted',
      score: feedback.overallScore,
      aiFeedback: feedback,
    };

    // Add follow-up to AI chat
    const followUp = getFollowUpMessage(currentQuestion, 0);

    const updatedSession: InterviewSession = {
      ...session,
      attempts: [...session.attempts, attempt],
      aiMessages: [...session.aiMessages, followUp],
      totalTimeSeconds: elapsedSeconds,
    };

    setSession(updatedSession);
    persistSession(updatedSession);
    setCurrentFeedback(attempt);
    setShowFeedback(true);
    setIsSubmitting(false);
  }, [session, currentQuestion, code, language, questionElapsed, elapsedSeconds]);

  // ─── Next question ────────────────────────────────────────────────────
  const handleNextQuestion = () => {
    if (!session) return;
    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex >= session.questions.length) {
      // Interview complete
      const finalSession: InterviewSession = {
        ...session,
        status: 'completed',
        endTime: new Date(),
        totalTimeSeconds: elapsedSeconds,
      };
      persistSession(finalSession);
      incrementStreak();
      router.push(`/interview/report/${finalSession.id}`);
      return;
    }

    const nextQuestion = session.questions[nextIndex];
    const greeting = getInterviewerGreeting(nextQuestion);

    const updatedSession: InterviewSession = {
      ...session,
      currentQuestionIndex: nextIndex,
      aiMessages: [...session.aiMessages, greeting],
    };

    setSession(updatedSession);
    persistSession(updatedSession);
    setCode(CODE_TEMPLATES[language]);
    setHintsUsed(0);
    setQuestionElapsed(0);
    setShowFeedback(false);
    setCurrentFeedback(null);
  };

  // ─── Skip question ────────────────────────────────────────────────────
  const handleSkip = () => {
    if (!session || !currentQuestion) return;
    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      question: currentQuestion,
      code: code || '// Skipped',
      language,
      timeTaken: questionElapsed,
      status: 'skipped',
      score: 0,
    };
    const updatedSession: InterviewSession = {
      ...session,
      attempts: [...session.attempts, attempt],
    };
    setSession(updatedSession);
    persistSession(updatedSession);
    setCurrentFeedback(attempt);
    setShowFeedback(true);
  };

  // ─── Hint ─────────────────────────────────────────────────────────────
  const handleHint = () => {
    if (!session || !currentQuestion || hintsUsed >= currentQuestion.hints.length) return;
    const hintMsg = getHintMessage(currentQuestion, hintsUsed);
    const updatedSession: InterviewSession = {
      ...session,
      aiMessages: [...session.aiMessages, hintMsg],
    };
    setSession(updatedSession);
    persistSession(updatedSession);
    setHintsUsed((h) => h + 1);
  };

  // ─── Send chat message ────────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!session || !userMessage.trim()) return;
    const userMsg: AIMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
      type: 'question',
    };
    const encouragement = getEncouragementMessage();
    const updatedSession: InterviewSession = {
      ...session,
      aiMessages: [...session.aiMessages, userMsg, encouragement],
    };
    setSession(updatedSession);
    persistSession(updatedSession);
    setUserMessage('');
  };

  // ─── Language change ──────────────────────────────────────────────────
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(CODE_TEMPLATES[lang]);
  };

  // ── SETUP PHASE ─────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Link href="/interview" className="text-sm text-slate-500 hover:text-accent inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M14 8a.75.75 0 01-.75.75H4.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L4.56 7.25H13.25A.75.75 0 0114 8z" clipRule="evenodd" />
              </svg>
              Back to Interview Hub
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Mock Interview</h1>
                <p className="text-sm text-slate-500">Practice with AI-powered feedback</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Question count */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Questions</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all duration-150 ${
                        questionCount === n
                          ? 'bg-accent text-white border-accent shadow-btn-primary'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-accent hover:text-accent'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {['', 'Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d || 'Any'}
                      onClick={() => setFilterDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                        filterDifficulty === d
                          ? d === 'Easy'
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : d === 'Medium'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : d === 'Hard'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-accent text-white border-accent'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {d || 'Any'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold capitalize transition-all duration-150 ${
                        language === lang
                          ? 'bg-accent text-white border-accent'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-accent hover:text-accent'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra features */}
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🔴</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Record Interview</p>
                      <p className="text-xs text-slate-400">Review your performance later</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRecording((r) => !r)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${isRecording ? 'bg-accent' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isRecording ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">📄</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Resume-Based Questions</p>
                      <p className="text-xs text-slate-400">Paste resume text for tailored Qs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResumeField((r) => !r)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${showResumeField ? 'bg-accent' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${showResumeField ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              {showResumeField && (
                <textarea
                  rows={4}
                  placeholder="Paste your resume text here (skills, experience, education)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-accent resize-none"
                />
              )}

              <button
                onClick={handleStart}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-btn-primary hover:-translate-y-0.5 text-sm"
              >
                Start Mock Interview →
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── INTERVIEWING PHASE ───────────────────────────────────────────────────────
  if (phase === 'interviewing' && session && currentQuestion) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-3 flex-shrink-0 shadow-sm z-10">
          <Link href="/interview" className="text-slate-400 hover:text-slate-600 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>

          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <span className="text-purple-600">🤖</span>
            <span>Mock Interview</span>
          </div>

          {/* Question progress dots */}
          <div className="flex items-center gap-1.5 ml-2">
            {session.questions.map((_, i) => {
              const attempted = session.attempts[i];
              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i < session.currentQuestionIndex
                      ? session.attempts[i]?.status === 'solved'
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                      : i === session.currentQuestionIndex
                        ? 'bg-accent ring-2 ring-blue-200'
                        : 'bg-slate-200'
                  }`}
                  title={`Q${i + 1}`}
                />
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                REC
              </div>
            )}

            <Timer
              totalSeconds={questionElapsed}
              limitMinutes={currentQuestion.timeLimit}
              isPaused={isPaused}
            />

            <button
              onClick={() => setIsPaused((p) => !p)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors duration-150"
            >
              {isPaused ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zM6.75 7.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5zm5 0a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Main split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question + AI Chat */}
          <div className="w-80 xl:w-96 bg-white border-r border-slate-100 flex flex-col overflow-hidden flex-shrink-0">
            <QuestionPanel
              question={currentQuestion}
              questionIndex={session.currentQuestionIndex}
              totalQuestions={session.questions.length}
              hintsUsed={hintsUsed}
              onHint={handleHint}
              aiMessages={session.aiMessages}
              userMessage={userMessage}
              onUserMessage={setUserMessage}
              onSendMessage={handleSendMessage}
            />
          </div>

          {/* Right: Editor + Controls */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(val) => setCode(val ?? '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 16 },
                  renderWhitespace: 'boundary',
                }}
              />
            </div>

            {/* Action bar */}
            <div className="bg-white border-t border-slate-100 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors duration-150"
              >
                Skip
              </button>
              <button
                onClick={handleHint}
                disabled={hintsUsed >= currentQuestion.hints.length}
                className="px-3 py-1.5 border border-amber-200 text-amber-600 bg-amber-50 text-sm font-semibold rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors duration-150"
              >
                💡 Hint
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !code.trim()}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors duration-150 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Evaluating...
                  </>
                ) : (
                  'Submit Answer ✓'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback overlay */}
        {showFeedback && currentFeedback && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                {/* Score header */}
                <div className={`rounded-xl p-4 mb-4 flex items-center gap-4 ${
                  currentFeedback.status === 'solved' ? 'bg-emerald-50' : currentFeedback.status === 'skipped' ? 'bg-slate-50' : 'bg-amber-50'
                }`}>
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg width="64" height="64" className="rotate-[-90deg]">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="26"
                        fill="none"
                        stroke={currentFeedback.score >= 80 ? '#10b981' : currentFeedback.score >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="5"
                        strokeDasharray={163.4}
                        strokeDashoffset={163.4 - (currentFeedback.score / 100) * 163.4}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
                      {currentFeedback.score}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">
                      {currentFeedback.status === 'solved' ? '✅ Accepted!' : currentFeedback.status === 'skipped' ? '⏭ Skipped' : '⚠ Needs Work'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Time: {Math.floor(currentFeedback.timeTaken / 60)}m {currentFeedback.timeTaken % 60}s
                    </p>
                  </div>
                </div>

                {currentFeedback.aiFeedback && (
                  <div className="space-y-4">
                    {/* Complexity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Time</p>
                        <p className="font-mono font-bold text-slate-700 mt-0.5">{currentFeedback.aiFeedback.timeComplexity}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Space</p>
                        <p className="font-mono font-bold text-slate-700 mt-0.5">{currentFeedback.aiFeedback.spaceComplexity}</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">AI Feedback</p>
                      <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 rounded-lg p-3">
                        {currentFeedback.aiFeedback.explanation}
                      </p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                        <ul className="space-y-1">
                          {currentFeedback.aiFeedback.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-emerald-500 mt-0.5">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Improve</p>
                        <ul className="space-y-1">
                          {currentFeedback.aiFeedback.improvements.map((s, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-amber-500 mt-0.5">→</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 py-2.5 bg-accent text-white font-bold text-sm rounded-xl hover:bg-accent-hover transition-colors duration-150"
                  >
                    {session.currentQuestionIndex + 1 >= session.questions.length
                      ? 'Finish Interview →'
                      : 'Next Question →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
