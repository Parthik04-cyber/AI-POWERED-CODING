'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Layout from '@/layouts/MainLayout';
import { useAuthStore } from '@/utils/store';

// ─── Types ────────────────────────────────────────────────────────────────────

type PostType = 'discussion' | 'poll' | 'interview' | 'solution';

interface PollOption {
  text: string;
  votes: number;
}

interface Post {
  id: string;
  author: string;
  authorHandle: string;
  avatarColor: string;
  initials: string;
  title: string;
  description: string;
  upvotes: number;
  comments: number;
  views: number;
  timestamp: string;
  category: string;
  tags: string[];
  isUpvoted: boolean;
  type: PostType;
  poll?: PollOption[];
  votedOptionIndex?: number;
  linkedProblem?: string;
  company?: string;
}

interface BuddyProfile {
  name: string;
  handle: string;
  topics: string[];
  level: string;
  streak: number;
  avatarColor: string;
  initials: string;
  online: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BANNERS = [
  {
    id: 1,
    title: 'Spring Coding Challenge 2026',
    subtitle: 'Compete, learn, and win prizes in our biggest contest yet',
    cta: 'Join Now',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    badge: 'LIVE',
  },
  {
    id: 2,
    title: 'AI-Powered Problem Recommendations',
    subtitle: 'Let our AI guide your learning path based on your skill level',
    cta: 'Try It',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    badge: 'NEW',
  },
  {
    id: 3,
    title: 'Interview Prep Bootcamp',
    subtitle: '30-day structured plan to crack FAANG interviews',
    cta: 'Start Plan',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    badge: 'POPULAR',
  },
];

const CATEGORIES = ['For You', 'Career', 'Contest', 'Compensation', 'Feedback', 'Interview'];

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Priya Sharma',
    authorHandle: 'priya_codes',
    avatarColor: 'bg-violet-500',
    initials: 'PS',
    title: 'How I cracked Google L5 after 3 attempts — my honest experience',
    description:
      'After two failed attempts, I completely restructured my prep. Here\'s what actually worked: focusing on patterns, not problems. I solved 150 problems but from only 15 pattern categories...',
    upvotes: 2841,
    comments: 347,
    views: 64200,
    timestamp: '2h ago',
    category: 'Interview',
    tags: ['Google', 'L5', 'System Design', 'Behavioral'],
    isUpvoted: false,
    type: 'interview',
    company: 'Google',
  },
  {
    id: '2',
    author: 'Alex Chen',
    authorHandle: 'alexc_dev',
    avatarColor: 'bg-blue-500',
    initials: 'AC',
    title: 'Poll: What\'s your preferred programming language for competitive coding?',
    description: 'Curious about the community\'s preference. Each language has its trade-offs — Python for readability, C++ for speed, Java for its standard library...',
    upvotes: 1203,
    comments: 189,
    views: 28700,
    timestamp: '5h ago',
    category: 'Contest',
    tags: ['Poll', 'Languages', 'Competitive'],
    isUpvoted: true,
    type: 'poll',
    poll: [
      { text: 'C++', votes: 4821 },
      { text: 'Python', votes: 3102 },
      { text: 'Java', votes: 1544 },
      { text: 'JavaScript', votes: 876 },
      { text: 'Go', votes: 302 },
    ],
  },
  {
    id: '3',
    author: 'Marcus Williams',
    authorHandle: 'marcusw',
    avatarColor: 'bg-emerald-500',
    initials: 'MW',
    title: 'My solution for Two Sum using HashMap achieves O(n) — discussion',
    description:
      'I noticed many people still use the O(n²) brute force approach. Let me walk through the HashMap approach which reduces it to a single pass. The key insight is storing complements...',
    upvotes: 934,
    comments: 112,
    views: 18900,
    timestamp: '8h ago',
    category: 'For You',
    tags: ['Two Sum', 'HashMap', 'O(n)', 'Easy'],
    isUpvoted: false,
    type: 'solution',
    linkedProblem: 'Two Sum',
  },
  {
    id: '4',
    author: 'Neha Gupta',
    authorHandle: 'neha_g',
    avatarColor: 'bg-pink-500',
    initials: 'NG',
    title: 'Meta E4 → E5 compensation breakdown (full details)',
    description:
      'TC: $380K. Here\'s the split: Base $185K, Stock $150K/yr (4yr vest, refreshes after 2yr), Bonus $45K target. Negotiated by having a competing Amazon offer, meta moved up 15%...',
    upvotes: 4102,
    comments: 523,
    views: 95300,
    timestamp: '1d ago',
    category: 'Compensation',
    tags: ['Meta', 'E5', 'TC', 'Negotiation'],
    isUpvoted: false,
    type: 'discussion',
    company: 'Meta',
  },
  {
    id: '5',
    author: 'Sam Park',
    authorHandle: 'sampark',
    avatarColor: 'bg-amber-500',
    initials: 'SP',
    title: 'Looking for DSA buddy — targeting Tier-1 SWE roles this Fall',
    description:
      'Currently working through Blind 75 + NeetCode 150. Need someone to review each other\'s solutions daily, do mock interviews weekly, and stay accountable. Available evenings IST...',
    upvotes: 287,
    comments: 64,
    views: 5400,
    timestamp: '2d ago',
    category: 'Career',
    tags: ['Buddy Finder', 'DSA', 'Mock Interview', 'FAANG'],
    isUpvoted: false,
    type: 'discussion',
  },
  {
    id: '6',
    author: 'Lisa Torres',
    authorHandle: 'lisatc',
    avatarColor: 'bg-teal-500',
    initials: 'LT',
    title: 'Feedback on CodeMaster\'s new AI hint system — feature request',
    description:
      'The AI hints are great but I wish there were difficulty levels (subtle nudge vs full explanation). Also it would be amazing to see hints for follow-up questions like "can you do better than O(n log n)?"...',
    upvotes: 756,
    comments: 94,
    views: 12100,
    timestamp: '3d ago',
    category: 'Feedback',
    tags: ['Feature Request', 'AI Hints', 'UX'],
    isUpvoted: false,
    type: 'discussion',
  },
];

const TRENDING_TOPICS = [
  { tag: 'System Design', posts: 2841, hot: true },
  { tag: 'Dynamic Programming', posts: 2103, hot: true },
  { tag: 'Two Pointers', posts: 1876, hot: false },
  { tag: 'Meta Interview', posts: 1654, hot: true },
  { tag: 'Google L5', posts: 1421, hot: false },
  { tag: 'LC Hard', posts: 1284, hot: false },
  { tag: 'Graphs', posts: 989, hot: false },
];

const INTERVIEW_DISCUSSIONS = [
  { title: 'Amazon OA 2026 — leaked questions (be prepared)', views: '42K', category: 'Amazon' },
  { title: 'Bloomberg SDE2 process — 6 rounds breakdown', views: '18K', category: 'Bloomberg' },
  { title: 'Stripe L4 — coding round was completely different this year', views: '35K', category: 'Stripe' },
];

const CAREER_DISCUSSIONS = [
  { title: 'SWE at FAANG vs startup — honest 5-yr comparison', views: '61K' },
  { title: 'Switching from SWE to ML — is it worth it in 2026?', views: '28K' },
  { title: 'Remote-first jobs that still pay top dollar', views: '44K' },
];

const COMPANY_DISCUSSIONS = [
  { name: 'Google', count: 1284, color: 'text-blue-600 bg-blue-50' },
  { name: 'Meta', count: 987, color: 'text-indigo-600 bg-indigo-50' },
  { name: 'Amazon', count: 1105, color: 'text-orange-600 bg-orange-50' },
  { name: 'Microsoft', count: 876, color: 'text-green-600 bg-green-50' },
  { name: 'Apple', count: 654, color: 'text-slate-600 bg-slate-100' },
  { name: 'Stripe', count: 421, color: 'text-purple-600 bg-purple-50' },
];

const BUDDY_PROFILES: BuddyProfile[] = [
  { name: 'Raj Patel', handle: 'rajp', topics: ['Trees', 'Graphs', 'DP'], level: 'Intermediate', streak: 34, avatarColor: 'bg-violet-500', initials: 'RP', online: true },
  { name: 'Emily Zhang', handle: 'emilyz', topics: ['Arrays', 'Strings', 'Sliding Window'], level: 'Beginner', streak: 12, avatarColor: 'bg-pink-500', initials: 'EZ', online: true },
  { name: 'David Kim', handle: 'davidk', topics: ['System Design', 'OOP', 'Heaps'], level: 'Advanced', streak: 89, avatarColor: 'bg-cyan-500', initials: 'DK', online: false },
  { name: 'Ananya Roy', handle: 'ananya', topics: ['Binary Search', 'Backtracking'], level: 'Intermediate', streak: 21, avatarColor: 'bg-emerald-500', initials: 'AR', online: true },
];

const AI_SUGGESTIONS: Record<string, string> = {
  '1': "Based on your question about cracking Google L5, I suggest focusing on: (1) **Pattern recognition** — master 15 core patterns rather than memorizing solutions; (2) **System design at scale** — practice designing systems for 100M+ users; (3) **Behavioral alignment** — map every STAR story to Google's leadership principles. Resources: Grokking the System Design Interview + Alex Xu's System Design Vol. 2.",
  '3': "For the Two Sum HashMap approach: the key insight is **using the complement as a hash key**. Store `target - num` as you scan. Time: O(n), Space: O(n). You can also do O(1) space with two-pointer on sorted array if you can modify input or use indices. Follow-up: if the array is sorted, two-pointer is strictly better. If multiple pairs needed, adjust accordingly.",
  default: "I've analyzed this post and here are my suggestions: Focus on the core algorithmic pattern being discussed. Consider edge cases like empty inputs, duplicates, and overflow. If this is a system design question, think about scalability, consistency, and availability trade-offs. Would you like me to elaborate on any specific aspect?",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = 'bg-slate-100 text-slate-600' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
    {text}
  </span>
);

const PostTypeIcon: React.FC<{ type: PostType }> = ({ type }) => {
  switch (type) {
    case 'poll':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'interview':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'solution':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
  }
};

const PollCard: React.FC<{
  options: PollOption[];
  votedIndex?: number;
  onVote: (idx: number) => void;
}> = ({ options, votedIndex, onVote }) => {
  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);
  return (
    <div className="mt-3 space-y-2">
      {options.map((opt, idx) => {
        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        const isVoted = votedIndex === idx;
        return (
          <button
            key={idx}
            onClick={() => onVote(idx)}
            className={`w-full text-left rounded-lg border transition-all overflow-hidden ${
              isVoted ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="relative px-3 py-2">
              <div
                className={`absolute inset-0 rounded-lg transition-all ${isVoted ? 'bg-blue-100' : 'bg-slate-50'}`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between text-sm">
                <span className={`font-medium ${isVoted ? 'text-blue-700' : 'text-slate-700'}`}>{opt.text}</span>
                <span className={`text-xs ${isVoted ? 'text-blue-500' : 'text-slate-400'}`}>{pct}%</span>
              </div>
            </div>
          </button>
        );
      })}
      <p className="text-xs text-slate-400">{totalVotes.toLocaleString()} votes</p>
    </div>
  );
};

// ─── Create Post Modal ────────────────────────────────────────────────────────

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (post: Partial<Post>) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('For You');
  const [type, setType] = useState<PostType>('discussion');
  const [tags, setTags] = useState('');
  const [company, setCompany] = useState('');
  const [linkedProblem, setLinkedProblem] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      type,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      company: company || undefined,
      linkedProblem: linkedProblem || undefined,
      poll: type === 'poll' ? pollOptions.filter(Boolean).map((t) => ({ text: t, votes: 0 })) : undefined,
    });
  };

  const TYPE_OPTIONS: { value: PostType; label: string; icon: string }[] = [
    { value: 'discussion', label: 'Discussion', icon: '💬' },
    { value: 'poll', label: 'Poll', icon: '📊' },
    { value: 'interview', label: 'Interview Exp', icon: '🏢' },
    { value: 'solution', label: 'Solution', icon: '💡' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Create a Post</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Post Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Post Type</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                    type === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Write a descriptive title..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Share your thoughts, experience, or question..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Poll options */}
          {type === 'poll' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Poll Options</label>
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Solution — linked problem */}
          {type === 'solution' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Linked Problem</label>
              <input
                type="text"
                value={linkedProblem}
                onChange={(e) => setLinkedProblem(e.target.value)}
                placeholder="e.g. Two Sum, LRU Cache..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          )}

          {/* Interview — company */}
          {type === 'interview' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Amazon, Meta..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tags <span className="font-normal normal-case text-slate-400">(comma-separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Arrays, Two Pointers, Google"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── DSA Buddy Finder Panel ───────────────────────────────────────────────────

const BuddyFinderPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [level, setLevel] = useState('All');
  const [topic, setTopic] = useState('');
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const filtered = BUDDY_PROFILES.filter(
    (b) =>
      (level === 'All' || b.level === level) &&
      (!topic || b.topics.some((t) => t.toLowerCase().includes(topic.toLowerCase())))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🤝</span> DSA Buddy Finder
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Find a coding partner for daily practice</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  level === l ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Filter by topic (e.g. DP, Trees)..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />

          {/* Profiles */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">No buddies found. Try different filters.</p>
            ) : (
              filtered.map((buddy) => (
                <div key={buddy.handle} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className={`w-10 h-10 rounded-full ${buddy.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0 relative`}>
                    {buddy.initials}
                    {buddy.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{buddy.name}</span>
                      <span className="text-xs text-slate-400">@{buddy.handle}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        buddy.level === 'Advanced' ? 'bg-purple-100 text-purple-700' :
                        buddy.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {buddy.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {buddy.topics.map((t) => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <p className="text-xs text-amber-600 mt-1.5">🔥 {buddy.streak}-day streak</p>
                  </div>
                  <button
                    onClick={() => setRequestedId(buddy.handle)}
                    disabled={requestedId === buddy.handle}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      requestedId === buddy.handle
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {requestedId === buddy.handle ? '✓ Requested' : 'Connect'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── AI Suggestion Modal ──────────────────────────────────────────────────────

const AIModal: React.FC<{ post: Post; onClose: () => void }> = ({ post, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestion(AI_SUGGESTIONS[post.id] || AI_SUGGESTIONS.default);
      setLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, [post.id]);

  const formatted = suggestion.split('**').map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Answer Suggestion</h3>
              <p className="text-xs text-slate-400">Powered by CodeMaster AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs text-slate-500 mb-3 font-medium">For: <span className="text-slate-700">{post.title}</span></p>
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-400">Analyzing and generating suggestions...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-slate-700 leading-relaxed">{formatted}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-4 flex gap-2">
          <button className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
            Not Helpful
          </button>
          <button className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700">
            Helpful ✓
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard: React.FC<{
  post: Post;
  onUpvote: (id: string) => void;
  onAI: (post: Post) => void;
  onVote: (postId: string, optionIdx: number) => void;
}> = ({ post, onUpvote, onAI, onVote }) => {
  const TYPE_COLORS: Record<PostType, string> = {
    discussion: 'bg-slate-100 text-slate-600',
    poll: 'bg-amber-100 text-amber-700',
    interview: 'bg-blue-100 text-blue-700',
    solution: 'bg-emerald-100 text-emerald-700',
  };

  const formatNum = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <article className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-sm transition-all group">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full ${post.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
          {post.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">{post.author}</span>
            <span className="text-xs text-slate-400">@{post.authorHandle}</span>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-400">{post.timestamp}</span>
            {post.company && (
              <Badge text={post.company} color="bg-indigo-50 text-indigo-600" />
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${TYPE_COLORS[post.type]}`}>
          <PostTypeIcon type={post.type} />
          <span className="capitalize">{post.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        {post.linkedProblem && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-slate-400">Linked to:</span>
            <Link href="/problems" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
              {post.linkedProblem}
            </Link>
          </div>
        )}
        <h2 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors cursor-pointer">
          {post.title}
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{post.description}</p>

        {/* Poll */}
        {post.type === 'poll' && post.poll && (
          <PollCard
            options={post.poll}
            votedIndex={post.votedOptionIndex}
            onVote={(idx) => onVote(post.id, idx)}
          />
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50">
        <button
          onClick={() => onUpvote(post.id)}
          className={`flex items-center gap-1.5 text-sm transition-all ${
            post.isUpvoted
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <svg className={`w-4 h-4 ${post.isUpvoted ? 'fill-blue-600' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span>{formatNum(post.upvotes)}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{formatNum(post.comments)}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{formatNum(post.views)}</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={() => onAI(post)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 text-xs font-medium text-violet-700 hover:from-violet-100 hover:to-blue-100 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Suggest
        </button>

        <button className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </article>
  );
};

// ─── Main Discuss Page ────────────────────────────────────────────────────────

const DiscussPage: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeCategory, setActiveCategory] = useState('For You');
  const [activeBanner, setActiveBanner] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuddyFinder, setShowBuddyFinder] = useState(false);
  const [aiPost, setAiPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate banners
  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, []);

  const handleUpvote = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isUpvoted: !p.isUpvoted, upvotes: p.isUpvoted ? p.upvotes - 1 : p.upvotes + 1 }
          : p
      )
    );
  };

  const handleVote = (postId: string, optionIdx: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        if (p.votedOptionIndex !== undefined) return p; // already voted
        const updatedPoll = p.poll.map((opt, i) =>
          i === optionIdx ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return { ...p, poll: updatedPoll, votedOptionIndex: optionIdx };
      })
    );
  };

  const handleCreatePost = (newPost: Partial<Post>) => {
    const post: Post = {
      id: String(Date.now()),
      author: user?.username || 'Anonymous',
      authorHandle: user?.username?.toLowerCase() || 'anon',
      avatarColor: 'bg-slate-500',
      initials: (user?.username || 'AN').slice(0, 2).toUpperCase(),
      upvotes: 0,
      comments: 0,
      views: 0,
      timestamp: 'just now',
      isUpvoted: false,
      ...newPost,
      title: newPost.title || '',
      description: newPost.description || '',
      category: newPost.category || 'For You',
      tags: newPost.tags || [],
      type: newPost.type as PostType || 'discussion',
    };
    setPosts((prev) => [post, ...prev]);
    setShowCreateModal(false);
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = activeCategory === 'For You' || p.category === activeCategory;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const banner = BANNERS[activeBanner];

  return (
    <Layout>
      <div className="min-h-full bg-slate-50">
        {/* ── Featured Banner ────────────────────────────────────────────── */}
        <div className={`relative bg-gradient-to-r ${banner.gradient} overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4 relative">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full tracking-wider">
                  {banner.badge}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{banner.title}</h1>
              <p className="text-white/80 text-sm mt-1">{banner.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="px-4 py-2 bg-white text-slate-800 text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-md">
                {banner.cta}
              </button>
            </div>
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 pb-3">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === activeBanner ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* ── Left: Feed ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search discussions..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Special Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {/* Buddy Finder */}
              <button
                onClick={() => setShowBuddyFinder(true)}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
              >
                <span className="text-2xl">🤝</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">DSA Buddy Finder</p>
                  <p className="text-xs text-slate-500 mt-0.5">Find a practice partner</p>
                </div>
              </button>

              {/* Interview Experience */}
              <button
                onClick={() => setActiveCategory('Interview')}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:border-amber-200 hover:shadow-sm transition-all text-left"
              >
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Company Experiences</p>
                  <p className="text-xs text-slate-500 mt-0.5">Read & share interviews</p>
                </div>
              </button>

              {/* Coding Poll */}
              <button
                onClick={() => { setShowCreateModal(true); }}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-200 hover:shadow-sm transition-all text-left"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Create a Poll</p>
                  <p className="text-xs text-slate-500 mt-0.5">Survey the community</p>
                </div>
              </button>
            </div>

            {/* Post Feed */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">No discussions found</p>
                <p className="text-sm mt-1">Be the first to start one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpvote={handleUpvote}
                    onAI={setAiPost}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right Sidebar ────────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">

            {/* Trending Topics */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.001 2.5c.74 2.13.33 3.85-1.23 5.16-1.17.98-1.7 2.33-1.57 4.05 1.53-.47 2.66-1.42 3.4-2.86 2.54 1.87 3.81 4.16 3.81 6.87 0 2.13-.72 3.84-2.15 5.12A7.066 7.066 0 019.5 22c-1.88 0-3.49-.63-4.82-1.9C3.36 18.83 2.7 17.21 2.7 15.24c0-2.58 1.01-4.8 3.03-6.65C7.35 7.11 8.63 5.74 9.57 4.48c.63-.84 1.44-1.5 2.43-1.98z" />
                </svg>
                Trending Topics
              </h3>
              <div className="space-y-2">
                {TRENDING_TOPICS.map((topic, i) => (
                  <button
                    key={topic.tag}
                    onClick={() => setSearch(topic.tag)}
                    className="w-full flex items-center justify-between group hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                      <span className="text-sm text-slate-700 group-hover:text-blue-600 font-medium transition-colors">
                        #{topic.tag}
                      </span>
                      {topic.hot && (
                        <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-medium">hot</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{topic.posts.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Discussions */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-base">🎤</span> Interview Discussions
              </h3>
              <div className="space-y-3">
                {INTERVIEW_DISCUSSIONS.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveCategory('Interview')}
                    className="w-full text-left group"
                  >
                    <p className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{item.category}</span>
                      <span className="text-xs text-slate-400">{item.views} views</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Career Discussions */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-base">💼</span> Career Discussions
              </h3>
              <div className="space-y-3">
                {CAREER_DISCUSSIONS.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveCategory('Career')}
                    className="w-full text-left group"
                  >
                    <p className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
                      {item.title}
                    </p>
                    <span className="text-xs text-slate-400">{item.views} views</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Company Discussions */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-base">🏢</span> Company Discussions
              </h3>
              <div className="flex flex-wrap gap-2">
                {COMPANY_DISCUSSIONS.map((co) => (
                  <button
                    key={co.name}
                    onClick={() => setSearch(co.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity ${co.color}`}
                  >
                    {co.name}
                    <span className="opacity-60">{co.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DSA Buddy CTA */}
            <button
              onClick={() => setShowBuddyFinder(true)}
              className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-4 text-white text-left hover:opacity-95 transition-opacity"
            >
              <p className="text-sm font-bold mb-1">🤝 Find Your DSA Buddy</p>
              <p className="text-xs text-white/80 leading-relaxed">
                Connect with developers at your level and practice DSA daily.
              </p>
              <span className="inline-block mt-2 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                Browse {BUDDY_PROFILES.length} online →
              </span>
            </button>
          </aside>
        </div>

        {/* ── Modals ─────────────────────────────────────────────────────── */}
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreatePost}
          />
        )}
        {showBuddyFinder && (
          <BuddyFinderPanel onClose={() => setShowBuddyFinder(false)} />
        )}
        {aiPost && (
          <AIModal post={aiPost} onClose={() => setAiPost(null)} />
        )}
      </div>
    </Layout>
  );
};

export default DiscussPage;
