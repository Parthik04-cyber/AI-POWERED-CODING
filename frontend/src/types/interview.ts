export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type InterviewType = 'mock' | 'online_assessment' | 'phone' | 'onsite';
export type SessionStatus = 'not_started' | 'in_progress' | 'paused' | 'completed';
export type QuestionStatus = 'unattempted' | 'attempted' | 'solved' | 'skipped';
export type Company = 'Amazon' | 'Google' | 'Microsoft' | 'Meta' | 'Apple' | 'Netflix';

export interface InterviewQuestion {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  timeLimit: number; // minutes
  hints: string[];
  followUpQuestions: string[];
  exampleTestCases: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  companies: Company[];
  acceptanceRate: number;
}

export interface QuestionAttempt {
  questionId: string;
  question: InterviewQuestion;
  code: string;
  language: string;
  timeTaken: number; // seconds
  status: QuestionStatus;
  score: number;
  aiFeedback?: AIFeedback;
  followUpAnswers?: { question: string; answer: string }[];
}

export interface AIMessage {
  id: string;
  role: 'interviewer' | 'user' | 'system';
  content: string;
  timestamp: Date;
  type: 'question' | 'feedback' | 'hint' | 'followup' | 'encouragement';
}

export interface AIFeedback {
  overallScore: number; // 0-100
  codeQuality: number;
  timeComplexity: string;
  spaceComplexity: string;
  correctness: number;
  efficiency: number;
  readability: number;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  optimalSolution?: string;
  explanation: string;
}

export interface InterviewSession {
  id: string;
  type: InterviewType;
  company?: Company;
  title: string;
  questions: InterviewQuestion[];
  attempts: QuestionAttempt[];
  currentQuestionIndex: number;
  status: SessionStatus;
  startTime: Date | null;
  endTime?: Date | null;
  totalTimeSeconds: number;
  aiMessages: AIMessage[];
  isRecording: boolean;
  streak: number;
}

export interface InterviewReport {
  sessionId: string;
  title: string;
  type: InterviewType;
  company?: Company;
  completedAt: Date;
  totalQuestions: number;
  solved: number;
  score: number; // 0-100
  totalTimeSeconds: number;
  attempts: QuestionAttempt[];
  weakAreas: string[];
  strongAreas: string[];
  timeComplexityAnalysis: {
    question: string;
    yourComplexity: string;
    optimalComplexity: string;
    isOptimal: boolean;
  }[];
  overallFeedback: string;
  recommendations: string[];
  rank: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface InterviewHistory {
  id: string;
  title: string;
  type: InterviewType;
  company?: Company;
  date: Date;
  score: number;
  totalQuestions: number;
  solved: number;
  duration: number; // minutes
  rank: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface UserInterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  totalProblemsAttempted: number;
  totalProblemsSolved: number;
  weakAreas: string[];
  strongAreas: string[];
  byDifficulty: {
    easy: { attempted: number; solved: number };
    medium: { attempted: number; solved: number };
    hard: { attempted: number; solved: number };
  };
  byCompany: Record<string, { attempted: number; solved: number }>;
  recentActivity: { date: string; count: number }[];
}

export interface CompanyQuestionSet {
  company: Company;
  totalQuestions: number;
  description: string;
  popularTopics: string[];
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  avgRounds: number;
  interviewProcess: string[];
  tipTitle: string;
  tip: string;
  color: string;
  bgGradient: string;
  logo: string;
}

export const MOCK_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    title: 'Two Sum',
    slug: 'two-sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    category: 'Array',
    tags: ['Array', 'Hash Table'],
    timeLimit: 20,
    hints: [
      'A brute force approach would give O(n²) — can you do better?',
      'Think about using a hash map to store complements.',
      'For each number x, check if target - x exists in your map.',
    ],
    followUpQuestions: [
      "What's the time complexity of your solution?",
      'How would you handle duplicate elements?',
      'Can you solve it in one pass?',
    ],
    exampleTestCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    acceptanceRate: 49.1,
  },
  {
    id: 'q2',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Easy',
    category: 'Stack',
    tags: ['String', 'Stack'],
    timeLimit: 15,
    hints: [
      'Use a stack data structure.',
      'Push opening brackets onto the stack.',
      'When you encounter a closing bracket, check if it matches the top of the stack.',
    ],
    followUpQuestions: [
      'What is the space complexity of your solution?',
      'How would you handle an empty string?',
    ],
    exampleTestCases: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    acceptanceRate: 40.2,
  },
  {
    id: 'q3',
    title: 'LRU Cache',
    slug: 'lru-cache',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the key if it exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, evict the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    difficulty: 'Medium',
    category: 'Design',
    tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
    timeLimit: 35,
    hints: [
      'Use a combination of a hash map and a doubly linked list.',
      'The hash map gives O(1) access, the linked list maintains order.',
      'Move accessed/updated nodes to the front of the list.',
    ],
    followUpQuestions: [
      "Why use a doubly linked list instead of a singly linked list?",
      'How would you implement an LFU cache instead?',
      'What changes if the cache is accessed concurrently?',
    ],
    exampleTestCases: [
      {
        input: 'capacity = 2, operations: put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)',
        output: '1, -1, -1, 3, 4',
      },
    ],
    constraints: ['1 ≤ capacity ≤ 3000', '0 ≤ key ≤ 10⁴', '0 ≤ value ≤ 10⁵'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    acceptanceRate: 42.3,
  },
  {
    id: 'q4',
    title: 'Merge K Sorted Lists',
    slug: 'merge-k-sorted-lists',
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
    difficulty: 'Hard',
    category: 'Linked List',
    tags: ['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    timeLimit: 40,
    hints: [
      'Consider using a priority queue (min-heap) to always pick the smallest element.',
      'Alternatively, use divide and conquer — merge pairs of lists.',
      'The optimal approach is O(N log k) where N is total nodes.',
    ],
    followUpQuestions: [
      'What is the time complexity of using a priority queue approach?',
      'How does divide and conquer compare to the naive approach?',
      'How would you handle null lists in the array?',
    ],
    exampleTestCases: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' },
    ],
    constraints: ['k == lists.length', '0 ≤ k ≤ 10⁴', '0 ≤ lists[i].length ≤ 500'],
    companies: ['Amazon', 'Google', 'Meta'],
    acceptanceRate: 51.8,
  },
  {
    id: 'q5',
    title: 'Word Search II',
    slug: 'word-search-ii',
    description: `Given an \`m x n\` board of characters and a list of strings \`words\`, return all words on the board.

Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.`,
    difficulty: 'Hard',
    category: 'Trie',
    tags: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'],
    timeLimit: 45,
    hints: [
      'Build a Trie from the words list for efficient prefix matching.',
      'Use DFS + backtracking on the board.',
      'When a word is found, mark it to avoid duplicates.',
    ],
    followUpQuestions: [
      "What's the advantage of Trie over using a HashSet?",
      'How do you handle duplicate words in the output?',
      'What optimizations can you apply to prune the search?',
    ],
    exampleTestCases: [
      { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' },
    ],
    constraints: ['m == board.length', '1 ≤ m, n ≤ 12', '1 ≤ words.length ≤ 3 × 10⁴'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    acceptanceRate: 37.5,
  },
];

export const COMPANY_SETS: CompanyQuestionSet[] = [
  {
    company: 'Amazon',
    totalQuestions: 241,
    description: 'Focus on Leadership Principles, system design, and scalability. Amazon favors practical problem-solving with clear communication.',
    popularTopics: ['Array', 'Dynamic Programming', 'Tree', 'Graph', 'System Design'],
    difficulty: { easy: 35, medium: 45, hard: 20 },
    avgRounds: 5,
    interviewProcess: ['Online Assessment', 'Phone Screen', 'Virtual Onsite (4-5 rounds)', 'Bar Raiser'],
    tipTitle: 'Leadership Principles',
    tip: 'Know all 16 Amazon Leadership Principles. Every behavioral question maps to one.',
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-amber-50',
    logo: '🛒',
  },
  {
    company: 'Google',
    totalQuestions: 287,
    description: 'Google interviews emphasize algorithmic thinking, data structures, and code quality. Expect open-ended problems requiring elegant solutions.',
    popularTopics: ['Graph', 'Dynamic Programming', 'String', 'Math', 'System Design'],
    difficulty: { easy: 20, medium: 50, hard: 30 },
    avgRounds: 5,
    interviewProcess: ['Phone Screen (1-2)', 'Onsite (4-5 rounds)', 'Hiring Committee Review'],
    tipTitle: 'Clean Code',
    tip: 'Googlers value clean, readable code. Talk through your thought process at every step.',
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    logo: '🔍',
  },
  {
    company: 'Microsoft',
    totalQuestions: 198,
    description: 'Microsoft focuses on problem-solving ability and culture fit. Interviews are collaborative with emphasis on system design for senior roles.',
    popularTopics: ['Array', 'String', 'Tree', 'Dynamic Programming', 'OOP Design'],
    difficulty: { easy: 40, medium: 45, hard: 15 },
    avgRounds: 4,
    interviewProcess: ['Recruiter Call', 'Technical Phone Screen', 'Onsite (4 rounds)', 'As-Appropriate (AA)'],
    tipTitle: 'Collaboration',
    tip: 'Microsoft values collaboration. Show how you work with others and handle feedback gracefully.',
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    logo: '💻',
  },
  {
    company: 'Meta',
    totalQuestions: 175,
    description: 'Meta (formerly Facebook) interviews focus on product sense, coding speed, and system design. They value people who move fast.',
    popularTopics: ['Dynamic Programming', 'Graph', 'Array', 'System Design', 'Product Design'],
    difficulty: { easy: 25, medium: 50, hard: 25 },
    avgRounds: 4,
    interviewProcess: ['Recruiter Screen', 'Technical Phone (2 rounds)', 'Onsite (coding + system design + behavior)'],
    tipTitle: 'Speed Matters',
    tip: 'Meta values coding speed. Practice writing bug-free code quickly under time pressure.',
    color: 'text-blue-700',
    bgGradient: 'from-blue-50 to-sky-50',
    logo: '📘',
  },
];
