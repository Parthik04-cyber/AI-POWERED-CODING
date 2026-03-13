'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { useAuthStore } from '@/utils/store';
import {
  fetchUserCourseProgress,
  getNextIncompleteLesson,
  saveUserCourseProgress,
} from '@/services/learningProgressService';

interface PracticeProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
}

interface Chapter {
  id: string;
  title: string;
  lessonTitle: string;
  explanation: string[];
  exampleTitle: string;
  exampleExplanation: string;
  codeSnippet: string;
  visualBars: number[];
  practiceProblems: PracticeProblem[];
  quiz: QuizQuestion[];
}

const chapters: Chapter[] = [
  {
    id: 'intro',
    title: 'Introduction',
    lessonTitle: 'How To Think Like A Problem Solver',
    explanation: [
      'Coding interviews reward structured thinking more than memorized syntax. Start by understanding constraints, identifying input patterns, and defining a clear plan before coding.',
      'Break every problem into three phases: model the data, select a strategy, then validate with edge cases. This keeps your solutions precise and easier to explain in interviews.',
    ],
    exampleTitle: 'Example: Plan Before Code',
    exampleExplanation:
      'For a duplicate-check problem, identify the data structure first. A set tracks seen values in $O(1)$ average time and gives a clean one-pass solution.',
    codeSnippet: `function hasDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();

  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }

  return false;
}`,
    visualBars: [20, 40, 70, 90],
    practiceProblems: [
      { title: 'Find Duplicate Number', difficulty: 'Easy', points: 50 },
      { title: 'Valid Anagram', difficulty: 'Easy', points: 45 },
      { title: 'Top K Frequent Elements', difficulty: 'Medium', points: 95 },
    ],
    quiz: [
      {
        id: 'intro-q1',
        question: 'What should you do before writing code in interviews?',
        options: [
          'Jump to implementation quickly',
          'Clarify constraints and propose a strategy',
          'Memorize all edge cases from memory',
          'Write brute force and stop',
        ],
        answerIndex: 1,
      },
      {
        id: 'intro-q2',
        question: 'Why is discussing complexity important?',
        options: [
          'It is optional and rarely useful',
          'It helps interviewers understand trade-offs in your solution',
          'Only needed for dynamic programming',
          'It replaces testing',
        ],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'arrays-strings',
    title: 'Arrays and Strings',
    lessonTitle: 'Two-Pointer and Sliding Window Foundations',
    explanation: [
      'Arrays and strings are linear containers where position matters. Efficient solutions often avoid nested loops by using pointer movement and frequency tracking.',
      'Sliding window is ideal for contiguous subarray/substring optimization. Grow the window to include candidates and shrink it when constraints break.',
    ],
    exampleTitle: 'Example: Longest Unique Substring',
    exampleExplanation:
      'Maintain a dynamic window and a map of last seen indices to skip redundant scans and keep complexity linear.',
    codeSnippet: `function lengthOfLongestSubstring(s: string): number {
  const last = new Map<string, number>();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && (last.get(ch) as number) >= left) {
      left = (last.get(ch) as number) + 1;
    }
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`,
    visualBars: [35, 50, 65, 80, 95],
    practiceProblems: [
      { title: 'Two Sum', difficulty: 'Easy', points: 40 },
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', points: 110 },
      { title: 'Minimum Window Substring', difficulty: 'Hard', points: 170 },
    ],
    quiz: [
      {
        id: 'arr-q1',
        question: 'When is sliding window most useful?',
        options: [
          'Tree traversal problems',
          'Contiguous range optimization problems',
          'Hash map key sorting only',
          'Graph shortest path only',
        ],
        answerIndex: 1,
      },
      {
        id: 'arr-q2',
        question: 'What is a major benefit of two pointers?',
        options: [
          'Always gives $O(log n)$',
          'Reduces extra space to zero in all cases',
          'Can replace nested loops with linear scans in many problems',
          'Only works on linked lists',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'hashing',
    title: 'Hashing',
    lessonTitle: 'Frequency Maps and Constant-Time Lookups',
    explanation: [
      'Hash maps and sets are core interview tools for trading space for speed. They let you track counts, occurrences, and relationships in near constant time.',
      'Use hashing when the problem asks for existence, duplicate detection, grouping by key, or complement lookups.',
    ],
    exampleTitle: 'Example: Group Anagrams',
    exampleExplanation:
      'Build a normalized key (sorted characters) for each word and group by key in a map.',
    codeSnippet: `function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of strs) {
    const key = word.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    (groups.get(key) as string[]).push(word);
  }

  return Array.from(groups.values());
}`,
    visualBars: [45, 60, 88, 76],
    practiceProblems: [
      { title: 'Valid Sudoku', difficulty: 'Medium', points: 95 },
      { title: 'Group Anagrams', difficulty: 'Medium', points: 105 },
      { title: 'LRU Cache', difficulty: 'Hard', points: 180 },
    ],
    quiz: [
      {
        id: 'hash-q1',
        question: 'Why use a hash set for duplicate checks?',
        options: [
          'It sorts values automatically',
          'It gives fast existence checks',
          'It uses less memory than arrays always',
          'It avoids all edge cases',
        ],
        answerIndex: 1,
      },
      {
        id: 'hash-q2',
        question: 'A common hashing trade-off is:',
        options: [
          'More time, less space',
          'No time change, no space change',
          'Less time, more space',
          'Less time, less space always',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    lessonTitle: 'Pointer Manipulation and Fast-Slow Techniques',
    explanation: [
      'Linked lists test your ability to reason about node references. Most bugs come from losing pointers during mutation, so use temporary references deliberately.',
      'Fast-slow pointer techniques solve cycle detection, middle node, and list partition patterns cleanly.',
    ],
    exampleTitle: 'Example: Reverse Linked List',
    exampleExplanation:
      'Track previous and next nodes while iterating so links can be safely reversed in-place.',
    codeSnippet: `type ListNode = { val: number; next: ListNode | null };

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr) {
    const nextNode = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }

  return prev;
}`,
    visualBars: [30, 42, 58, 75, 92],
    practiceProblems: [
      { title: 'Reverse Linked List', difficulty: 'Easy', points: 50 },
      { title: 'Merge Two Sorted Lists', difficulty: 'Easy', points: 55 },
      { title: 'Linked List Cycle II', difficulty: 'Medium', points: 120 },
    ],
    quiz: [
      {
        id: 'll-q1',
        question: 'What helps prevent pointer-loss bugs in list mutation?',
        options: [
          'Skipping temporary variables',
          'Keeping a next reference before changing links',
          'Recursion only',
          'Sorting nodes first',
        ],
        answerIndex: 1,
      },
      {
        id: 'll-q2',
        question: 'Fast-slow pointers are useful for:',
        options: [
          'Hashing optimization only',
          'Cycle detection and midpoint finding',
          'String matching only',
          'Binary search trees only',
        ],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'stacks-queues',
    title: 'Stacks and Queues',
    lessonTitle: 'Monotonic Patterns and Ordered Processing',
    explanation: [
      'Stacks follow LIFO and are excellent for nested structure problems, expression parsing, and monotonic constraints. Queues follow FIFO for layered processing like BFS.',
      'Monotonic stacks are powerful for nearest greater/smaller element patterns in linear time.',
    ],
    exampleTitle: 'Example: Valid Parentheses',
    exampleExplanation:
      'Use a stack to track opening brackets and validate every closing bracket in order.',
    codeSnippet: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }

  return stack.length === 0;
}`,
    visualBars: [55, 72, 68, 82],
    practiceProblems: [
      { title: 'Valid Parentheses', difficulty: 'Easy', points: 45 },
      { title: 'Daily Temperatures', difficulty: 'Medium', points: 130 },
      { title: 'Largest Rectangle in Histogram', difficulty: 'Hard', points: 185 },
    ],
    quiz: [
      {
        id: 'sq-q1',
        question: 'Monotonic stack helps solve:',
        options: [
          'Only recursion problems',
          'Nearest greater/smaller element problems',
          'Trie operations only',
          'Binary heap insertion only',
        ],
        answerIndex: 1,
      },
      {
        id: 'sq-q2',
        question: 'Queue is preferred when:',
        options: [
          'You need depth-first traversal',
          'You need first-in-first-out processing order',
          'You need random access',
          'You need key hashing',
        ],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'trees-graphs',
    title: 'Trees and Graphs',
    lessonTitle: 'Traversal Strategy and State Tracking',
    explanation: [
      'Tree and graph questions assess traversal discipline. Choose DFS for deep recursive decomposition and BFS for shortest layers and level-order logic.',
      'In graphs, explicit visited tracking is essential to avoid cycles and repeated work.',
    ],
    exampleTitle: 'Example: Binary Tree Level Order Traversal',
    exampleExplanation:
      'Process nodes layer-by-layer using a queue, collecting each level before moving on.',
    codeSnippet: `type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const size = queue.length;
    const level: number[] = [];

    for (let i = 0; i < size; i++) {
      const node = queue.shift() as TreeNode;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}`,
    visualBars: [25, 48, 66, 74, 85, 98],
    practiceProblems: [
      { title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', points: 50 },
      { title: 'Number of Islands', difficulty: 'Medium', points: 140 },
      { title: 'Course Schedule II', difficulty: 'Hard', points: 190 },
    ],
    quiz: [
      {
        id: 'tg-q1',
        question: 'When is BFS generally preferred?',
        options: [
          'When searching shortest unweighted path or levels',
          'When doing in-place array reversal',
          'When sorting numbers',
          'When building hash maps',
        ],
        answerIndex: 0,
      },
      {
        id: 'tg-q2',
        question: 'Why maintain a visited set in graph traversal?',
        options: [
          'To ensure sorted traversal order only',
          'To reduce memory usage',
          'To prevent cycles and duplicate processing',
          'To avoid recursion syntax',
        ],
        answerIndex: 2,
      },
    ],
  },
];

const difficultyClasses: Record<PracticeProblem['difficulty'], string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

const chapterIndexMap = chapters.reduce((acc, chapter, index) => {
  acc[chapter.id] = index;
  return acc;
}, {} as Record<string, number>);

const CoursePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const learnerName = user?.fullName || user?.username || 'CodeMaster Learner';
  const courseId = typeof router.query.courseId === 'string' ? router.query.courseId : '1';
  const lessonIdFromQuery = typeof router.query.lessonId === 'string' ? router.query.lessonId : '';
  const userId = user?.userId || 'guest';

  const [activeChapterId, setActiveChapterId] = useState(chapters[0].id);
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});
  const [solvedProblems, setSolvedProblems] = useState<Record<string, Record<number, boolean>>>({});
  const [quizSelections, setQuizSelections] = useState<Record<string, Record<string, number>>>({});
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<string[]>([
    'Ask me to simplify this lesson, give an interview-style explanation, or provide an intuition-first approach.',
  ]);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) as Chapter;

  const totalPracticeProblems = useMemo(
    () => chapters.reduce((sum, chapter) => sum + chapter.practiceProblems.length, 0),
    []
  );

  const solvedCount = useMemo(
    () => Object.values(solvedProblems).reduce((sum, chapterMap) => sum + Object.values(chapterMap).filter(Boolean).length, 0),
    [solvedProblems]
  );

  const completedLessons = Object.values(completedChapters).filter(Boolean).length;
  const courseProgress = Math.round((completedLessons / chapters.length) * 100);

  const earnedQuizPoints = Object.values(quizScores).reduce((sum, score) => sum + score * 20, 0);
  const rewardPoints = completedLessons * 120 + solvedCount * 35 + earnedQuizPoints;

  const badges = useMemo(() => {
    const next: string[] = [];
    if (completedLessons >= 1) next.push('Lesson Starter');
    if (solvedCount >= 5) next.push('Practice Grinder');
    if (Object.keys(quizScores).length >= 3) next.push('Quiz Warrior');
    if (courseProgress >= 100) next.push('Course Finisher');
    return next;
  }, [completedLessons, solvedCount, quizScores, courseProgress]);

  const allQuizzesSubmitted = chapters.every((chapter) => quizScores[chapter.id] !== undefined);
  const certificateEligible = courseProgress === 100 && allQuizzesSubmitted;

  const chapterCompletionText = `${completedLessons}/${chapters.length} chapters complete`;

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    let isMounted = true;

    const initializeCourseProgress = async () => {
      const progress = await fetchUserCourseProgress(userId, courseId);
      if (!isMounted) {
        return;
      }

      const completedMap = (progress.completedLessonIds || []).reduce((acc, lessonId) => {
        acc[lessonId] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setCompletedChapters(completedMap);

      const fallbackLessonId = getNextIncompleteLesson(courseId, progress.completedLessonIds || []);
      const requestedLessonId = lessonIdFromQuery && chapterIndexMap[lessonIdFromQuery] !== undefined ? lessonIdFromQuery : '';
      setActiveChapterId(requestedLessonId || fallbackLessonId);
    };

    initializeCourseProgress();

    return () => {
      isMounted = false;
    };
  }, [courseId, lessonIdFromQuery, router.isReady, userId]);

  const toggleProblemSolved = (chapterId: string, problemIndex: number) => {
    setSolvedProblems((prev) => {
      const chapterMap = prev[chapterId] || {};
      return {
        ...prev,
        [chapterId]: {
          ...chapterMap,
          [problemIndex]: !chapterMap[problemIndex],
        },
      };
    });
  };

  const markLessonComplete = (chapterId: string) => {
    setCompletedChapters((prev) => {
      const nextCompleted = { ...prev, [chapterId]: true };
      const completedLessonIds = Object.keys(nextCompleted).filter((lessonId) => nextCompleted[lessonId]);
      const nextLessonId = getNextIncompleteLesson(courseId, completedLessonIds);

      saveUserCourseProgress(userId, courseId, {
        completedLessonIds,
        lastLessonId: nextLessonId,
      });

      const currentIndex = chapterIndexMap[chapterId];
      const nextChapter = chapters[currentIndex + 1];
      if (nextChapter) {
        setActiveChapterId(nextChapter.id);
      }

      return nextCompleted;
    });
  };

  const setQuizAnswer = (chapterId: string, questionId: string, answerIndex: number) => {
    setQuizSelections((prev) => ({
      ...prev,
      [chapterId]: {
        ...(prev[chapterId] || {}),
        [questionId]: answerIndex,
      },
    }));
  };

  const submitQuiz = (chapter: Chapter) => {
    const selectedAnswers = quizSelections[chapter.id] || {};
    let score = 0;

    for (const question of chapter.quiz) {
      if (selectedAnswers[question.id] === question.answerIndex) {
        score += 1;
      }
    }

    setQuizScores((prev) => ({ ...prev, [chapter.id]: score }));
  };

  const handleShare = (platform: 'x' | 'linkedin' | 'copy') => {
    const shareText = `I am learning ${activeChapter.title} on CodeMaster and tracking my interview prep progress.`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (platform === 'copy') {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      return;
    }

    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
    }

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
    }
  };

  const askAssistant = () => {
    const question = assistantInput.trim();
    if (!question) return;

    const response = `AI Explanation: In ${activeChapter.title}, focus on pattern recognition first. For "${question}", start with the brute-force intuition, then optimize with ${
      activeChapter.title === 'Arrays and Strings'
        ? 'sliding window or two pointers.'
        : activeChapter.title === 'Hashing'
        ? 'a map/set for constant-time lookups.'
        : activeChapter.title === 'Linked Lists'
        ? 'safe pointer transitions and temp references.'
        : activeChapter.title === 'Stacks and Queues'
        ? 'ordered processing with stack/queue invariants.'
        : activeChapter.title === 'Trees and Graphs'
        ? 'BFS/DFS traversal plus visited tracking.'
        : 'clear constraints and data modeling.'
    }`;

    setAssistantMessages((prev) => [...prev, `You: ${question}`, response]);
    setAssistantInput('');
  };

  return (
    <Layout>
      <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">Structured Learning</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">DSA Interview Mastery Course</h1>
              <p className="mt-2 text-slate-600 max-w-3xl">
                Follow chapter-by-chapter lessons, practice targeted problems, validate understanding with mini quizzes,
                and unlock rewards as you progress.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm min-w-[260px]">
              <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
                <span className="font-semibold">Course Progress</span>
                <span className="font-bold text-blue-600">{courseProgress}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${courseProgress}%` }} />
              </div>
              <p className="text-xs text-slate-500">{chapterCompletionText}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] gap-6">
            <aside className="lg:sticky lg:top-20 h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Course Chapters</h2>
              <div className="flex lg:block gap-2 overflow-x-auto pb-1 lg:overflow-visible">
                {chapters.map((chapter, idx) => {
                  const isActive = chapter.id === activeChapterId;
                  const isDone = Boolean(completedChapters[chapter.id]);
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setActiveChapterId(chapter.id)}
                      className={`text-left min-w-[220px] lg:min-w-0 w-full rounded-xl px-3 py-3 border transition-all duration-200 ${
                        isActive
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-500">Chapter {idx + 1}</span>
                        <span className={`text-xs font-bold ${isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isDone ? 'Done' : 'Pending'}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{chapter.title}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs uppercase font-semibold tracking-wide text-slate-500">Rewards Snapshot</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-white border border-slate-200 p-2">
                    <p className="text-lg font-extrabold text-slate-900">{rewardPoints}</p>
                    <p className="text-[11px] text-slate-500">Points</p>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-2">
                    <p className="text-lg font-extrabold text-slate-900">{badges.length}</p>
                    <p className="text-[11px] text-slate-500">Badges</p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Current Lesson</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{activeChapter.lessonTitle}</h2>
                  </div>
                  <button
                    onClick={() => markLessonComplete(activeChapter.id)}
                    className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    Mark Complete
                  </button>
                </div>

                <div className="space-y-3">
                  {activeChapter.explanation.map((para, idx) => (
                    <p key={idx} className="text-slate-700 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-slate-900">{activeChapter.exampleTitle}</h3>
                  <p className="mt-2 text-slate-600">{activeChapter.exampleExplanation}</p>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-4 overflow-x-auto">
                    <pre className="text-xs sm:text-sm text-cyan-100 whitespace-pre">{activeChapter.codeSnippet}</pre>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-slate-900">Topic Visualization</h3>
                  <p className="mt-2 text-slate-600">This visual tracks concept depth as the lesson progresses.</p>
                  <div className="mt-4 h-44 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 flex items-end gap-2">
                    {activeChapter.visualBars.map((value, index) => (
                      <div key={`${activeChapter.id}-bar-${index}`} className="flex-1 flex flex-col items-center justify-end gap-1">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-300"
                          style={{ height: `${value}%` }}
                          aria-label={`Concept level ${index + 1}`}
                        />
                        <span className="text-[10px] text-slate-500">L{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-900">Practice Problems</h3>
                  <p className="text-sm text-slate-500">
                    Solved {solvedCount}/{totalPracticeProblems} across course
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {activeChapter.practiceProblems.map((problem, index) => {
                    const solved = Boolean(solvedProblems[activeChapter.id]?.[index]);
                    return (
                      <div
                        key={`${activeChapter.id}-problem-${index}`}
                        className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{problem.title}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${difficultyClasses[problem.difficulty]}`}>
                              {problem.difficulty}
                            </span>
                            <span className="text-xs text-slate-500">+{problem.points} pts</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleProblemSolved(activeChapter.id, index)}
                          className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            solved
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {solved ? 'Solved' : 'Mark Solved'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                <h3 className="text-xl font-bold text-slate-900">Mini Quiz</h3>
                <p className="mt-1 text-sm text-slate-500">Validate your understanding before moving to the next chapter.</p>

                <div className="mt-4 space-y-5">
                  {activeChapter.quiz.map((question, index) => (
                    <div key={question.id} className="rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">
                        {index + 1}. {question.question}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {question.options.map((option, optionIndex) => {
                          const selected = quizSelections[activeChapter.id]?.[question.id] === optionIndex;
                          return (
                            <button
                              key={`${question.id}-option-${optionIndex}`}
                              onClick={() => setQuizAnswer(activeChapter.id, question.id, optionIndex)}
                              className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                                selected
                                  ? 'border-blue-400 bg-blue-50 text-blue-800'
                                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => submitQuiz(activeChapter)}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold transition-colors"
                  >
                    Submit Quiz
                  </button>
                  {quizScores[activeChapter.id] !== undefined && (
                    <p className="text-sm font-semibold text-slate-700">
                      Score: {quizScores[activeChapter.id]}/{activeChapter.quiz.length}
                    </p>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-slate-900">AI Explanation Assistant</h3>
                  <p className="mt-1 text-sm text-slate-500">Ask for simpler explanations, analogies, or interview phrasing help.</p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 h-52 overflow-y-auto space-y-2">
                    {assistantMessages.map((message, idx) => (
                      <p key={`assistant-msg-${idx}`} className="text-sm text-slate-700 leading-relaxed">
                        {message}
                      </p>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') askAssistant();
                      }}
                      placeholder="Ask for explanation..."
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                    <button
                      onClick={askAssistant}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                    >
                      Ask AI
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-slate-900">Social Sharing & Rewards</h3>
                  <p className="mt-1 text-sm text-slate-500">Share progress and keep momentum through achievements.</p>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleShare('x')}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Share on X
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Copy Link
                    </button>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">Reward Points</p>
                      <p className="text-xl font-extrabold text-slate-900">{rewardPoints}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {badges.length > 0 ? (
                        badges.map((badge) => (
                          <span key={badge} className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            {badge}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Complete lessons to unlock your first badge.</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                <h3 className="text-xl font-bold text-slate-900">Course Completion Certificate</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Finish every chapter and submit all quizzes to unlock your certificate.
                </p>

                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setCertificateGenerated(true)}
                    disabled={!certificateEligible}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      certificateEligible
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Generate Certificate
                  </button>
                  {!certificateEligible && (
                    <span className="text-sm text-slate-500">Complete all lessons and quizzes to enable.</span>
                  )}
                </div>

                {certificateGenerated && certificateEligible && (
                  <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 text-center">CodeMaster Certificate</p>
                    <h4 className="mt-2 text-3xl font-extrabold text-slate-900 text-center">Certificate of Completion</h4>
                    <p className="mt-4 text-center text-slate-700">
                      This certifies that <span className="font-bold">{learnerName}</span> completed the
                      <span className="font-bold"> DSA Interview Mastery Course</span>.
                    </p>
                    <p className="mt-3 text-center text-sm text-slate-500">Issued on {new Date().toLocaleDateString()}</p>
                    <div className="mt-5 text-center">
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
                      >
                        Print Certificate
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePage;
