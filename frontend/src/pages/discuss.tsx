'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/layouts/MainLayout';
import { useAuthStore } from '@/utils/store';
import { discussAPI } from '@/services/api';

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

const DEFAULT_CATEGORY = 'All';

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
  categories: string[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit, categories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'General');
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
              {categories.map((c) => <option key={c}>{c}</option>)}
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

// ─── Report Modal ─────────────────────────────────────────────────────────────

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or self-promotion' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'misinformation', label: 'Misinformation or misleading content' },
  { value: 'nsfw', label: 'NSFW or inappropriate content' },
  { value: 'other', label: 'Other' },
] as const;

type ReportReason = typeof REPORT_REASONS[number]['value'];

const ReportModal: React.FC<{
  postId: string;
  postTitle: string;
  onClose: () => void;
}> = ({ postId, postTitle, onClose }) => {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await discussAPI.reportPost(postId, reason, details.trim() || undefined);
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Report Post</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Report submitted</h3>
              <p className="text-sm text-slate-500">Our moderation team will review this post. Thanks for keeping the community safe.</p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 line-clamp-2">
                Reporting: <span className="font-medium text-slate-700">{postTitle}</span>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Reason for report
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        reason === r.value
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-rose-500"
                      />
                      <span className="text-sm text-slate-700">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Additional details <span className="font-normal normal-case text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Provide more context if helpful..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  {loading ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard: React.FC<{
  post: Post;
  onUpvote: (id: string) => void;
  onVote: (postId: string, optionIdx: number) => void;
  onReport: (post: Post) => void;
}> = ({ post, onUpvote, onVote, onReport }) => {
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
          onClick={() => onReport(post)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          title="Report this post"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
      </div>
    </article>
  );
};

// ─── Main Discuss Page ────────────────────────────────────────────────────────

const DiscussPage: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState<Array<{ tag: string; posts: number }>>([]);
  const [categories, setCategories] = useState<string[]>([DEFAULT_CATEGORY]);
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportPost, setReportPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Load posts from API
  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await discussAPI.getPosts({
        limit: 100,
      });
      const serverPosts: Post[] = (res.data?.posts || []).map((p: any) => ({
        id: p.id,
        author: p.author,
        authorHandle: p.authorHandle,
        avatarColor: p.avatarColor || 'bg-slate-500',
        initials: p.initials || '??',
        title: p.title,
        description: p.description,
        upvotes: p.upvotes || 0,
        comments: p.comments || 0,
        views: p.views || 0,
        timestamp: p.timestamp,
        category: p.category,
        tags: p.tags || [],
        isUpvoted: p.isUpvoted || false,
        type: p.type || 'discussion',
        poll: p.poll || undefined,
        linkedProblem: p.linkedProblem || undefined,
        company: p.company || undefined,
      }));
      setPosts(serverPosts);
      const derivedCategories = Array.from(
        new Set(serverPosts.map((post) => post.category).filter(Boolean))
      );
      setCategories([DEFAULT_CATEGORY, ...derivedCategories]);
    } catch {
      setPosts([]);
      setCategories([DEFAULT_CATEGORY]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Load trending topics from API
  useEffect(() => {
    discussAPI.getTrendingTopics()
      .then((res) => {
        const topics = res.data?.topics || [];
        if (topics.length > 0) setTrendingTopics(topics);
      })
      .catch(() => {});
  }, []);

  const handleUpvote = async (id: string) => {
    if (!user) return;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isUpvoted: !p.isUpvoted, upvotes: p.isUpvoted ? p.upvotes - 1 : p.upvotes + 1 }
          : p
      )
    );
    try {
      const res = await discussAPI.upvotePost(id);
      const { upvotes, isUpvoted } = res.data;
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, upvotes, isUpvoted } : p))
      );
    } catch {
      // Revert optimistic update on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isUpvoted: !p.isUpvoted, upvotes: p.isUpvoted ? p.upvotes - 1 : p.upvotes + 1 }
            : p
        )
      );
    }
  };

  const handleVote = async (postId: string, optionIdx: number) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        if (p.votedOptionIndex !== undefined) return p;
        const updatedPoll = p.poll.map((opt, i) =>
          i === optionIdx ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return { ...p, poll: updatedPoll, votedOptionIndex: optionIdx };
      })
    );
    try {
      await discussAPI.votePoll(postId, optionIdx);
    } catch {
      // Best-effort; local state already updated
    }
  };

  const handleCreatePost = async (newPost: Partial<Post>) => {
    if (!user) {
      setCreateError('Please sign in to create a post.');
      return;
    }

    try {
      setCreateError(null);
      const res = await discussAPI.createPost({
        title: newPost.title || '',
        description: newPost.description || '',
        category: newPost.category || 'General',
        type: newPost.type,
        tags: newPost.tags,
        company: newPost.company,
        pollOptions: newPost.poll?.map((o) => o.text),
      });
      const created: Post = {
        id: res.data.id,
        author: res.data.author,
        authorHandle: res.data.authorHandle,
        avatarColor: res.data.avatarColor || 'bg-slate-500',
        initials: res.data.initials || (user.username || 'AN').slice(0, 2).toUpperCase(),
        upvotes: 0,
        comments: 0,
        views: 0,
        timestamp: 'just now',
        isUpvoted: false,
        title: res.data.title,
        description: res.data.description,
        category: res.data.category,
        tags: res.data.tags || [],
        type: (res.data.type || 'discussion') as PostType,
        poll: res.data.poll,
        company: res.data.company,
        linkedProblem: res.data.linkedProblem,
      };
      setPosts((prev) => [created, ...prev]);
      setShowCreateModal(false);
    } catch (err: any) {
      setCreateError(err?.response?.data?.error || 'Failed to create post.');
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = activeCategory === DEFAULT_CATEGORY || p.category === activeCategory;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const createModalCategories = categories.filter((cat) => cat !== DEFAULT_CATEGORY);

  return (
    <Layout>
      <div className="min-h-full bg-slate-50">
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
              {categories.map((cat) => (
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

            {createError && (
              <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{createError}</p>
            )}

            {/* Post Feed */}
            {loadingPosts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-full" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
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
                    onVote={handleVote}
                    onReport={setReportPost}
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
                {trendingTopics.map((topic, i) => (
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
                    </div>
                    <span className="text-xs text-slate-400">{topic.posts.toLocaleString()}</span>
                  </button>
                ))}
                {trendingTopics.length === 0 && (
                  <p className="text-xs text-slate-400">No trending data available.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* ── Modals ─────────────────────────────────────────────────────── */}
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreatePost}
            categories={createModalCategories.length > 0 ? createModalCategories : ['General']}
          />
        )}
        {reportPost && (
          <ReportModal
            postId={reportPost.id}
            postTitle={reportPost.title}
            onClose={() => setReportPost(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default DiscussPage;
