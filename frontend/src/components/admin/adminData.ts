'use client';

export interface AdminSection {
  href: string;
  label: string;
  description: string;
  accent: string;
}

export interface AdminContestPlan {
  id: string;
  name: string;
  format: string;
  status: 'Draft' | 'Scheduled' | 'Live';
  startTime: string;
  participantsTarget: number;
}

export interface AdminCoursePlan {
  id: string;
  title: string;
  track: string;
  lessons: number;
  status: 'Published' | 'Draft' | 'Review';
}

export interface ModerationQueueItem {
  id: string;
  title: string;
  category: string;
  reports: number;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Needs review' | 'Escalated' | 'Watching';
}

export const adminSections: AdminSection[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    description: 'Platform health, quick counts, and recent activity.',
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    href: '/admin/users',
    label: 'Users',
    description: 'Audit user accounts, roles, and engagement.',
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    href: '/admin/problems',
    label: 'Problems',
    description: 'Create, edit, and retire coding problems.',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    href: '/admin/contests',
    label: 'Contests',
    description: 'Manage contest schedules and publishing status.',
    accent: 'from-amber-500 to-orange-400',
  },
  {
    href: '/admin/courses',
    label: 'Courses',
    description: 'Organize learning paths and curriculum releases.',
    accent: 'from-fuchsia-500 to-pink-400',
  },
  {
    href: '/admin/store',
    label: 'Store',
    description: 'Review reward catalog, premium plans, and transactions.',
    accent: 'from-rose-500 to-orange-400',
  },
  {
    href: '/admin/discussions',
    label: 'Discussions',
    description: 'Moderation workspace for community content.',
    accent: 'from-slate-700 to-slate-500',
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    description: 'Submission trends, acceptance rates, and platform metrics.',
    accent: 'from-violet-500 to-purple-400',
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    description: 'Platform configuration, API keys, and admin preferences.',
    accent: 'from-slate-600 to-slate-500',
  },
];

export const adminContestPlans: AdminContestPlan[] = [
  {
    id: 'contest-402',
    name: 'Weekly Contest 402',
    format: '4 problems · 90 minutes',
    status: 'Scheduled',
    startTime: '2026-03-15T18:30:00',
    participantsTarget: 1800,
  },
  {
    id: 'contest-148',
    name: 'Biweekly Contest 148',
    format: '4 problems · 120 minutes',
    status: 'Draft',
    startTime: '2026-03-20T20:00:00',
    participantsTarget: 2400,
  },
  {
    id: 'contest-sprint-12',
    name: 'Starter Sprint 12',
    format: '3 problems · 60 minutes',
    status: 'Live',
    startTime: '2026-03-14T11:00:00',
    participantsTarget: 1200,
  },
];

export const adminCoursePlans: AdminCoursePlan[] = [
  {
    id: 'course-dsa-mastery',
    title: 'DSA Interview Mastery',
    track: 'Interview prep',
    lessons: 10,
    status: 'Published',
  },
  {
    id: 'course-graphs',
    title: 'Graph Patterns Deep Dive',
    track: 'Advanced algorithms',
    lessons: 8,
    status: 'Review',
  },
  {
    id: 'course-system-design',
    title: 'System Design Foundations',
    track: 'Architecture',
    lessons: 6,
    status: 'Draft',
  },
  {
    id: 'course-sliding-window',
    title: 'Sliding Window Lab',
    track: 'Pattern drills',
    lessons: 5,
    status: 'Published',
  },
];

export const moderationQueue: ModerationQueueItem[] = [
  {
    id: 'mod-1',
    title: 'Compensation thread with repeated off-topic replies',
    category: 'Compensation',
    reports: 12,
    severity: 'Medium',
    status: 'Needs review',
  },
  {
    id: 'mod-2',
    title: 'Interview leak post flagged by multiple users',
    category: 'Interview',
    reports: 24,
    severity: 'High',
    status: 'Escalated',
  },
  {
    id: 'mod-3',
    title: 'Contest poll attracting duplicate comments',
    category: 'Contest',
    reports: 5,
    severity: 'Low',
    status: 'Watching',
  },
  {
    id: 'mod-4',
    title: 'Feedback thread needs moderator response',
    category: 'Feedback',
    reports: 7,
    severity: 'Medium',
    status: 'Needs review',
  },
];

export const moderationGuidelines = [
  'Escalate leaked interview or contest content immediately.',
  'Review high-report threads within 2 hours during contest windows.',
  'Move product feedback into tracked requests when moderation is not required.',
  'Use rate limits and author warnings before full thread removal when possible.',
];