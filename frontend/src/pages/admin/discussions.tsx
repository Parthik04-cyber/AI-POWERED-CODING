'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { moderationAPI } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'Low' | 'Medium' | 'High';
type ModerationStatus = 'Needs review' | 'Escalated' | 'Watching' | 'Resolved';
type ModerationAction = 'approve' | 'delete_post' | 'warn_user' | 'escalate' | 'dismiss';

interface QueueItem {
  id: string;                  // report id
  discussionId: string;
  title: string;
  category: string;
  reports: number;
  severity: Severity;
  status: ModerationStatus;
  latestReason: string;
  latestDetails?: string;
  reporterUsername?: string;
  createdAt: string;
}

interface Stats {
  queueSize: number;
  escalated: number;
  highSeverity: number;
  resolvedToday: number;
}

interface ActionHistory {
  id: string;
  adminUsername: string;
  action: ModerationAction;
  notes?: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const severityStyles: Record<Severity, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  High: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const statusStyles: Record<ModerationStatus, string> = {
  'Needs review': 'bg-sky-50 text-sky-700',
  Escalated: 'bg-rose-100 text-rose-800',
  Watching: 'bg-amber-50 text-amber-700',
  Resolved: 'bg-slate-100 text-slate-500',
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  misinformation: 'Misinformation',
  nsfw: 'NSFW',
  other: 'Other',
};

const ACTION_CONFIG: Array<{
  action: ModerationAction;
  label: string;
  style: string;
  icon: string;
}> = [
  {
    action: 'approve',
    label: 'Approve',
    style: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: '✓',
  },
  {
    action: 'delete_post',
    label: 'Delete Post',
    style: 'bg-rose-600 hover:bg-rose-700 text-white',
    icon: '🗑',
  },
  {
    action: 'warn_user',
    label: 'Warn User',
    style: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: '⚠',
  },
  {
    action: 'escalate',
    label: 'Escalate',
    style: 'bg-orange-600 hover:bg-orange-700 text-white',
    icon: '↑',
  },
  {
    action: 'dismiss',
    label: 'Dismiss',
    style: 'bg-slate-500 hover:bg-slate-600 text-white',
    icon: '✕',
  },
];

const moderationGuidelines = [
  'Do not delete content based on opinion — only factual policy violations warrant removal.',
  'Harassment and NSFW reports should be escalated immediately for senior review.',
  'Misinformation about interview processes or salaries may be Watched but not deleted unless repeatedly reported.',
  'Spam accounts should have their posts removed; warm the account before banning.',
];

// ─── Action Modal ─────────────────────────────────────────────────────────────

const ActionModal: React.FC<{
  item: QueueItem;
  action: ModerationAction;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ item, action, onConfirm, onCancel, loading }) => {
  const [notes, setNotes] = useState('');
  const config = ACTION_CONFIG.find((a) => a.action === action)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {config.icon} {config.label}
          </h2>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.title}</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Notes <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Add context for this action..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(notes)}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${config.style}`}
            >
              {loading ? 'Processing…' : `Confirm ${config.label}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── History Drawer ───────────────────────────────────────────────────────────

const HistoryDrawer: React.FC<{
  reportId: string;
  onClose: () => void;
}> = ({ reportId, onClose }) => {
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moderationAPI.getActionHistory(reportId)
      .then((res) => setHistory(res.data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [reportId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-base font-bold text-slate-900">Action History</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">No actions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 capitalize">
                      {h.action.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">by {h.adminUsername}</p>
                  {h.notes && (
                    <p className="text-xs text-slate-600 mt-1.5 italic">{h.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Queue Item Card ──────────────────────────────────────────────────────────

const QueueCard: React.FC<{
  item: QueueItem;
  onAction: (item: QueueItem, action: ModerationAction) => void;
  onHistory: (reportId: string) => void;
}> = ({ item, onAction, onHistory }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${severityStyles[item.severity]}`}>
              {item.severity}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}>
              {item.status}
            </span>
            <span className="text-xs text-slate-400">{item.category}</span>
          </div>
          <p className="font-semibold text-slate-900 line-clamp-2 leading-snug">{item.title}</p>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>
              <strong className="text-slate-700">{item.reports}</strong> report{item.reports !== 1 ? 's' : ''}
            </span>
            <span>
              Reason: <strong className="text-slate-700">{REASON_LABELS[item.latestReason] || item.latestReason}</strong>
            </span>
            {item.reporterUsername && (
              <span>Reported by <strong className="text-slate-700">@{item.reporterUsername}</strong></span>
            )}
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          {item.latestDetails && (
            <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 italic line-clamp-2">
              &ldquo;{item.latestDetails}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ACTION_CONFIG.map((cfg) => (
          <button
            key={cfg.action}
            onClick={() => onAction(item, cfg.action)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${cfg.style}`}
          >
            <span>{cfg.icon}</span>
            {cfg.label}
          </button>
        ))}
        <button
          onClick={() => onHistory(item.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors ml-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </button>
      </div>
    </article>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminDiscussionsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [actionTarget, setActionTarget] = useState<{ item: QueueItem; action: ModerationAction } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [historyReportId, setHistoryReportId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [queueRes, statsRes] = await Promise.all([
        moderationAPI.getQueue({ limit: 100, status: filterStatus || undefined }),
        moderationAPI.getStats(),
      ]);
      setQueue(queueRes.data.items || []);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load moderation data.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (notes: string) => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await moderationAPI.takeAction({
        reportId: actionTarget.item.id,
        discussionId: actionTarget.item.discussionId,
        action: actionTarget.action,
        notes: notes || undefined,
      });
      setActionSuccess(`Action "${actionTarget.action.replace('_', ' ')}" applied successfully.`);
      setActionTarget(null);
      await load();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to apply action.');
      setActionTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminShell
      title="Discussion Moderation"
      description="Review reported posts, take moderation actions, and keep the community safe."
    >
      <div className="space-y-6">

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Queue size',
              value: loading ? '–' : String(stats?.queueSize ?? 0),
              color: 'text-slate-900',
            },
            {
              label: 'Escalated',
              value: loading ? '–' : String(stats?.escalated ?? 0),
              color: stats?.escalated ? 'text-rose-600' : 'text-slate-900',
            },
            {
              label: 'High severity',
              value: loading ? '–' : String(stats?.highSeverity ?? 0),
              color: stats?.highSeverity ? 'text-orange-600' : 'text-slate-900',
            },
            {
              label: 'Resolved today',
              value: loading ? '–' : String(stats?.resolvedToday ?? 0),
              color: 'text-emerald-700',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        {/* Feedback banners */}
        {actionSuccess && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-sm text-emerald-800 font-medium">
            ✓ {actionSuccess}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-3 text-sm text-rose-700 font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">✕</button>
          </div>
        )}

        {/* Filter bar + refresh */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter:</span>
          {['', 'Needs review', 'Escalated', 'Watching'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s || 'All open'}
            </button>
          ))}
          <button
            onClick={load}
            disabled={loading}
            className="ml-auto p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
          {/* Queue */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Moderation Queue
              {!loading && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({queue.length} item{queue.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-12 rounded-full bg-slate-200" />
                      <div className="h-5 w-20 rounded-full bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-7 w-20 rounded-xl bg-slate-200" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : queue.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">All clear!</p>
                <p className="text-sm text-slate-500">No pending reports in the queue.</p>
              </div>
            ) : (
              queue.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onAction={(i, a) => setActionTarget({ item: i, action: a })}
                  onHistory={setHistoryReportId}
                />
              ))
            )}
          </div>

          {/* Policy reminders sidebar */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Policy Reminders</h2>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              {moderationGuidelines.map((g, i) => (
                <div key={i} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {g}
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Action Reference</h3>
              <div className="space-y-2">
                {ACTION_CONFIG.map((cfg) => (
                  <div key={cfg.action} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <span className="shrink-0 font-bold text-slate-700">{cfg.icon}</span>
                    <div>
                      <span className="font-semibold text-slate-800">{cfg.label}</span>
                      {cfg.action === 'approve' && ' — Clears all reports; content is fine.'}
                      {cfg.action === 'delete_post' && ' — Removes the post and resolves all reports.'}
                      {cfg.action === 'warn_user' && ' — Marks for monitoring; keeps content visible.'}
                      {cfg.action === 'escalate' && ' — Flags for senior admin review.'}
                      {cfg.action === 'dismiss' && ' — Closes a single report without action.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      {actionTarget && (
        <ActionModal
          item={actionTarget.item}
          action={actionTarget.action}
          onConfirm={handleAction}
          onCancel={() => setActionTarget(null)}
          loading={actionLoading}
        />
      )}
      {historyReportId && (
        <HistoryDrawer
          reportId={historyReportId}
          onClose={() => setHistoryReportId(null)}
        />
      )}
    </AdminShell>
  );
};

export default AdminDiscussionsPage;