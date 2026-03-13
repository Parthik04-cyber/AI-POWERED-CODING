import {
  InterviewQuestion,
  InterviewSession,
  InterviewReport,
  InterviewHistory,
  UserInterviewStats,
  AIFeedback,
  AIMessage,
  MOCK_QUESTIONS,
  Difficulty,
} from '@/types/interview';

// ─── Local Storage Keys ───────────────────────────────────────────────────────
const SESSIONS_KEY = 'interview_sessions';
const HISTORY_KEY = 'interview_history';
const STATS_KEY = 'interview_stats';
const STREAK_KEY = 'interview_streak';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Question Bank ────────────────────────────────────────────────────────────
export function getRandomQuestions(
  count: number = 3,
  difficulty?: Difficulty,
  company?: string,
  category?: string
): InterviewQuestion[] {
  let pool = [...MOCK_QUESTIONS];
  if (difficulty) pool = pool.filter((q) => q.difficulty === difficulty);
  if (company) pool = pool.filter((q) => q.companies.includes(company as any));
  if (category) pool = pool.filter((q) => q.category === category);

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getCompanyQuestions(company: string, count = 5): InterviewQuestion[] {
  return getRandomQuestions(count, undefined, company);
}

// ─── Session Management ───────────────────────────────────────────────────────
export function createSession(
  type: InterviewSession['type'],
  questions: InterviewQuestion[],
  company?: InterviewSession['company']
): InterviewSession {
  const session: InterviewSession = {
    id: uid(),
    type,
    company,
    title: buildTitle(type, company),
    questions,
    attempts: [],
    currentQuestionIndex: 0,
    status: 'not_started',
    startTime: null,
    endTime: null,
    totalTimeSeconds: 0,
    aiMessages: [],
    isRecording: false,
    streak: loadStreak(),
  };
  persistSession(session);
  return session;
}

function buildTitle(type: InterviewSession['type'], company?: string): string {
  if (company) return `${company} Interview`;
  const map: Record<InterviewSession['type'], string> = {
    mock: 'Mock Interview',
    online_assessment: 'Online Assessment',
    phone: 'Phone Interview Simulation',
    onsite: 'Onsite Interview Simulation',
  };
  return map[type];
}

export function persistSession(session: InterviewSession): void {
  const all = loadFromStorage<Record<string, InterviewSession>>(SESSIONS_KEY, {});
  all[session.id] = session;
  saveToStorage(SESSIONS_KEY, all);
}

export function getSession(id: string): InterviewSession | null {
  const all = loadFromStorage<Record<string, InterviewSession>>(SESSIONS_KEY, {});
  return all[id] ?? null;
}

// ─── AI Feedback Engine ───────────────────────────────────────────────────────
export function generateAIFeedback(
  question: InterviewQuestion,
  code: string,
  timeTaken: number
): AIFeedback {
  const hasCode = code.trim().length > 20;
  const timeFraction = timeTaken / (question.timeLimit * 60);
  const baseScore = hasCode ? Math.min(95, 60 + Math.random() * 35) : 20;
  const timeBonus = timeFraction < 0.5 ? 10 : timeFraction < 0.8 ? 5 : 0;
  const finalScore = Math.round(Math.min(100, baseScore + timeBonus));

  const complexityMap: Record<Difficulty, { time: string; space: string }> = {
    Easy: { time: 'O(n)', space: 'O(1)' },
    Medium: { time: 'O(n log n)', space: 'O(n)' },
    Hard: { time: 'O(n²)', space: 'O(n)' },
  };

  const complexity = complexityMap[question.difficulty];

  return {
    overallScore: finalScore,
    codeQuality: Math.round(finalScore * 0.9 + Math.random() * 10),
    timeComplexity: complexity.time,
    spaceComplexity: complexity.space,
    correctness: Math.round(finalScore * 0.95),
    efficiency: Math.round(finalScore * 0.85 + Math.random() * 15),
    readability: Math.round(70 + Math.random() * 30),
    suggestions: getSuggestions(question, code, finalScore),
    strengths: getStrengths(finalScore),
    improvements: getImprovements(question, finalScore),
    explanation: getExplanation(question, finalScore),
  };
}

function getSuggestions(q: InterviewQuestion, code: string, score: number): string[] {
  const base = [
    `Consider using ${q.tags[1] ?? 'a more optimal data structure'} for better time complexity.`,
    'Add edge case handling for empty inputs.',
    'Variable names could be more descriptive.',
  ];
  if (score < 60) base.push('Review the fundamental algorithm pattern for this problem type.', 'Try drawing out the problem on paper first.');
  return base.slice(0, score < 70 ? 3 : 2);
}

function getStrengths(score: number): string[] {
  if (score >= 85) return ['Correct logic', 'Good code organization', 'Handled edge cases', 'Efficient solution'];
  if (score >= 65) return ['Core logic is correct', 'Readable code style'];
  return ['Attempted the problem', 'Basic structure is in place'];
}

function getImprovements(q: InterviewQuestion, score: number): string[] {
  if (score >= 85) return ['Could optimize space usage', 'Consider follow-up question variants'];
  return [
    `Study the ${q.category} pattern more deeply`,
    'Practice time complexity analysis',
    'Work on coding speed',
  ];
}

function getExplanation(q: InterviewQuestion, score: number): string {
  if (score >= 85) return `Excellent work on "${q.title}"! Your solution demonstrates a strong understanding of the ${q.category} pattern. The approach is efficient and well-structured.`;
  if (score >= 65) return `Good attempt on "${q.title}". Your solution captures the main idea but has room for optimization. Review the hints and consider the time complexity carefully.`;
  return `"${q.title}" is a classic ${q.category} problem. Review the hints provided and try to understand the optimal approach before re-attempting.`;
}

// ─── AI Interviewer Messages ──────────────────────────────────────────────────
export function getInterviewerGreeting(question: InterviewQuestion): AIMessage {
  return {
    id: uid(),
    role: 'interviewer',
    content: `Hi! I'm your AI interviewer today. Let's start with "${question.title}" — a ${question.difficulty} ${question.category} problem. Take a moment to read the description, then walk me through your approach before coding. There's no rush — think out loud!`,
    timestamp: new Date(),
    type: 'question',
  };
}

export function getFollowUpMessage(question: InterviewQuestion, index: number): AIMessage {
  const fq = question.followUpQuestions[index % question.followUpQuestions.length];
  return {
    id: uid(),
    role: 'interviewer',
    content: fq,
    timestamp: new Date(),
    type: 'followup',
  };
}

export function getEncouragementMessage(): AIMessage {
  const messages = [
    "You're doing great! Keep going.",
    "Good thinking! Consider the edge cases too.",
    "I like your approach — can you now think about optimization?",
    "Nice progress! What's the time complexity so far?",
    "That's a solid start. How would you test this solution?",
  ];
  return {
    id: uid(),
    role: 'interviewer',
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date(),
    type: 'encouragement',
  };
}

export function getHintMessage(question: InterviewQuestion, hintIndex: number): AIMessage {
  const hint = question.hints[Math.min(hintIndex, question.hints.length - 1)];
  return {
    id: uid(),
    role: 'interviewer',
    content: `💡 Hint: ${hint}`,
    timestamp: new Date(),
    type: 'hint',
  };
}

// ─── Report Generation ────────────────────────────────────────────────────────
export function generateReport(session: InterviewSession): InterviewReport {
  const solved = session.attempts.filter((a) => a.status === 'solved').length;
  const totalScore = session.attempts.reduce((sum, a) => sum + a.score, 0);
  const avgScore = session.attempts.length > 0 ? Math.round(totalScore / session.attempts.length) : 0;

  const allTopics = session.attempts.flatMap((a) => a.question.tags);
  const topicScores: Record<string, number[]> = {};
  session.attempts.forEach((a) => {
    a.question.tags.forEach((tag) => {
      if (!topicScores[tag]) topicScores[tag] = [];
      topicScores[tag].push(a.score);
    });
  });

  const weakAreas = Object.entries(topicScores)
    .filter(([, scores]) => scores.reduce((s, v) => s + v, 0) / scores.length < 60)
    .map(([tag]) => tag);

  const strongAreas = Object.entries(topicScores)
    .filter(([, scores]) => scores.reduce((s, v) => s + v, 0) / scores.length >= 80)
    .map(([tag]) => tag);

  const timeComplexityAnalysis = session.attempts.map((a) => ({
    question: a.question.title,
    yourComplexity: a.aiFeedback?.timeComplexity ?? 'N/A',
    optimalComplexity: getOptimalComplexity(a.question.difficulty),
    isOptimal: a.score >= 80,
  }));

  const rank = avgScore >= 85 ? 'Excellent' : avgScore >= 70 ? 'Good' : avgScore >= 50 ? 'Fair' : 'Poor';

  const report: InterviewReport = {
    sessionId: session.id,
    title: session.title,
    type: session.type,
    company: session.company,
    completedAt: new Date(),
    totalQuestions: session.questions.length,
    solved,
    score: avgScore,
    totalTimeSeconds: session.totalTimeSeconds,
    attempts: session.attempts,
    weakAreas,
    strongAreas,
    timeComplexityAnalysis,
    overallFeedback: getOverallFeedback(avgScore, solved, session.questions.length),
    recommendations: getRecommendations(weakAreas, avgScore),
    rank,
  };

  saveReport(report);
  updateStats(report);
  return report;
}

function getOptimalComplexity(difficulty: Difficulty): string {
  const map: Record<Difficulty, string> = { Easy: 'O(n)', Medium: 'O(n log n)', Hard: 'O(n log n)' };
  return map[difficulty];
}

function getOverallFeedback(score: number, solved: number, total: number): string {
  if (score >= 85) return `Outstanding performance! You solved ${solved}/${total} problems with excellent code quality. You demonstrate strong algorithmic thinking and clean coding practices.`;
  if (score >= 70) return `Good performance! You solved ${solved}/${total} problems. Your solutions show solid understanding, with room for optimization and edge case handling.`;
  if (score >= 50) return `Fair performance. You solved ${solved}/${total} problems. Focus on strengthening your foundational data structures and practice more consistently.`;
  return `You solved ${solved}/${total} problems. Don't be discouraged — consistent practice is the key. Focus on the weak areas and revisit fundamental patterns.`;
}

function getRecommendations(weakAreas: string[], score: number): string[] {
  const recs: string[] = [];
  if (score < 70) recs.push('Complete 5 easy problems per day for the next 2 weeks.');
  if (weakAreas.includes('Dynamic Programming')) recs.push('Study DP patterns: 0/1 Knapsack, Longest Common Subsequence.');
  if (weakAreas.includes('Graph')) recs.push('Practice BFS/DFS traversal problems and shortest path algorithms.');
  if (weakAreas.includes('Tree')) recs.push('Master tree traversals (inorder, preorder, postorder) and BST operations.');
  recs.push('Review time complexity analysis and practice writing optimal solutions.');
  recs.push('Focus on system design fundamentals for senior-level interviews.');
  return recs.slice(0, 4);
}

// ─── History & Stats ──────────────────────────────────────────────────────────
function saveReport(report: InterviewReport): void {
  const history = loadFromStorage<InterviewHistory[]>(HISTORY_KEY, []);
  const entry: InterviewHistory = {
    id: report.sessionId,
    title: report.title,
    type: report.type,
    company: report.company,
    date: report.completedAt,
    score: report.score,
    totalQuestions: report.totalQuestions,
    solved: report.solved,
    duration: Math.round(report.totalTimeSeconds / 60),
    rank: report.rank,
  };
  history.unshift(entry);
  saveToStorage(HISTORY_KEY, history.slice(0, 50)); // Keep last 50
}

export function getInterviewHistory(): InterviewHistory[] {
  return loadFromStorage<InterviewHistory[]>(HISTORY_KEY, []);
}

export function getReportById(id: string): InterviewReport | null {
  const sessions = loadFromStorage<Record<string, InterviewSession>>(SESSIONS_KEY, {});
  const session = sessions[id];
  if (!session || session.status !== 'completed') return null;
  return generateReport(session);
}

function updateStats(report: InterviewReport): void {
  const stats = loadFromStorage<Partial<UserInterviewStats>>(STATS_KEY, {});
  const updated: UserInterviewStats = {
    totalInterviews: (stats.totalInterviews ?? 0) + 1,
    completedInterviews: (stats.completedInterviews ?? 0) + 1,
    averageScore: Math.round(((stats.averageScore ?? 0) * (stats.completedInterviews ?? 0) + report.score) / ((stats.completedInterviews ?? 0) + 1)),
    bestScore: Math.max(stats.bestScore ?? 0, report.score),
    currentStreak: loadStreak(),
    longestStreak: Math.max(stats.longestStreak ?? 0, loadStreak()),
    totalProblemsAttempted: (stats.totalProblemsAttempted ?? 0) + report.totalQuestions,
    totalProblemsSolved: (stats.totalProblemsSolved ?? 0) + report.solved,
    weakAreas: report.weakAreas,
    strongAreas: report.strongAreas,
    byDifficulty: stats.byDifficulty ?? { easy: { attempted: 0, solved: 0 }, medium: { attempted: 0, solved: 0 }, hard: { attempted: 0, solved: 0 } },
    byCompany: stats.byCompany ?? {},
    recentActivity: stats.recentActivity ?? [],
  };
  saveToStorage(STATS_KEY, updated);
}

export function getUserStats(): UserInterviewStats {
  return loadFromStorage<UserInterviewStats>(STATS_KEY, {
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalProblemsAttempted: 0,
    totalProblemsSolved: 0,
    weakAreas: [],
    strongAreas: [],
    byDifficulty: { easy: { attempted: 0, solved: 0 }, medium: { attempted: 0, solved: 0 }, hard: { attempted: 0, solved: 0 } },
    byCompany: {},
    recentActivity: [],
  });
}

// ─── Streak System ────────────────────────────────────────────────────────────
export function loadStreak(): number {
  return loadFromStorage<number>(STREAK_KEY, 0);
}

export function incrementStreak(): number {
  const current = loadStreak();
  const next = current + 1;
  saveToStorage(STREAK_KEY, next);
  return next;
}
