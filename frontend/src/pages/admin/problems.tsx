'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { problemAPI } from '@/services/api';

interface ProblemRecord {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tags?: string[];
  examples?: Array<{ input: string; output: string }>;
  testCases?: Array<{ input: string; output: string }>;
}

interface ProblemCategoryStat {
  _id: string;
  count: number;
  totalSubmissions: number;
  totalAccepted: number;
}

const defaultForm = {
  title: '',
  description: '',
  difficulty: 'Easy',
  category: 'Arrays',
  tags: '',
  exampleInput: '',
  exampleOutput: '',
  testInput: '',
  testOutput: '',
};

const AdminProblemsPage: React.FC = () => {
  const [stats, setStats] = useState<ProblemCategoryStat[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [problemForm, setProblemForm] = useState(defaultForm);

  const loadProblemData = async () => {
    try {
      setLoading(true);
      const [statsRes, problemsRes] = await Promise.all([
        problemAPI.getStats(),
        problemAPI.getAllProblems(0, 100),
      ]);

      setStats(statsRes.data.stats || []);
      setProblems(problemsRes.data.problems || []);
    } catch (_error) {
      setMessage('Failed to load problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProblemData();
  }, []);

  const resetForm = () => {
    setEditingProblemId(null);
    setProblemForm(defaultForm);
  };

  const filteredProblems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return problems;
    }

    return problems.filter((problem) => {
      const haystack = [problem.title, problem.category, problem.difficulty, ...(problem.tags || [])]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [problems, searchTerm]);

  const handleSaveProblem = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    const payload = {
      title: problemForm.title,
      description: problemForm.description,
      difficulty: problemForm.difficulty,
      category: problemForm.category,
      tags: problemForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      examples: [
        {
          input: problemForm.exampleInput,
          output: problemForm.exampleOutput,
        },
      ],
      testCases: [
        {
          input: problemForm.testInput,
          output: problemForm.testOutput,
        },
      ],
      constraints: [],
    };

    try {
      if (editingProblemId) {
        await problemAPI.updateProblem(editingProblemId, payload);
        setMessage('Problem updated successfully.');
      } else {
        await problemAPI.createProblem(payload);
        setMessage('Problem created successfully.');
      }

      resetForm();
      await loadProblemData();
    } catch (saveError: any) {
      setMessage(saveError.response?.data?.error || 'Failed to save problem.');
    }
  };

  const handleEditProblem = (problem: ProblemRecord) => {
    setEditingProblemId(problem._id);
    setProblemForm({
      title: problem.title || '',
      description: problem.description || '',
      difficulty: problem.difficulty || 'Easy',
      category: problem.category || 'Arrays',
      tags: (problem.tags || []).join(', '),
      exampleInput: problem.examples?.[0]?.input || '',
      exampleOutput: problem.examples?.[0]?.output || '',
      testInput: problem.testCases?.[0]?.input || '',
      testOutput: problem.testCases?.[0]?.output || '',
    });
  };

  const handleDeleteProblem = async (problemId: string) => {
    const shouldDelete = window.confirm('Delete this problem?');

    if (!shouldDelete) {
      return;
    }

    try {
      await problemAPI.deleteProblem(problemId);
      if (editingProblemId === problemId) {
        resetForm();
      }
      setMessage('Problem deleted successfully.');
      await loadProblemData();
    } catch (_error) {
      setMessage('Failed to delete problem.');
    }
  };

  return (
    <AdminShell
      title="Problem Management"
      description="Problem CRUD now lives here instead of the dashboard. Use this page to publish, edit, and retire coding challenges."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total problems</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : problems.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Categories</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : stats.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Filtered view</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : filteredProblems.length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{editingProblemId ? 'Edit problem' : 'Add problem'}</h2>
              <p className="mt-2 text-sm text-slate-600">Keep creation and maintenance separate from dashboard monitoring.</p>
              <p className="mt-2 text-xs text-slate-500">
                Example and test-case values are stored as JSON objects: [{'{'}"input": "...", "output": "..."{'}'}].
                You can enter plain text in each field; JSON strings are also supported.
              </p>
            </div>
            {message ? <p className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">{message}</p> : null}
          </div>

          <form onSubmit={handleSaveProblem} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              value={problemForm.title}
              onChange={(event) => setProblemForm({ ...problemForm, title: event.target.value })}
              placeholder="Title"
              required
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500"
            />
            <input
              value={problemForm.category}
              onChange={(event) => setProblemForm({ ...problemForm, category: event.target.value })}
              placeholder="Category"
              required
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500"
            />
            <select
              value={problemForm.difficulty}
              onChange={(event) => setProblemForm({ ...problemForm, difficulty: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <input
              value={problemForm.tags}
              onChange={(event) => setProblemForm({ ...problemForm, tags: event.target.value })}
              placeholder="Tags (comma separated)"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500"
            />
            <textarea
              value={problemForm.description}
              onChange={(event) => setProblemForm({ ...problemForm, description: event.target.value })}
              placeholder="Problem description"
              required
              className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500 md:col-span-2"
            />
            <input
              value={problemForm.exampleInput}
              onChange={(event) => setProblemForm({ ...problemForm, exampleInput: event.target.value })}
              placeholder="Example input"
              required
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500"
            />
            <input
              value={problemForm.exampleOutput}
              onChange={(event) => setProblemForm({ ...problemForm, exampleOutput: event.target.value })}
              placeholder="Example output"
              required
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500"
            />
            <input
              value={problemForm.testInput}
              onChange={(event) => setProblemForm({ ...problemForm, testInput: event.target.value })}
              placeholder="Test case input"
              required
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500"
            />
            <input
              value={problemForm.testOutput}
              onChange={(event) => setProblemForm({ ...problemForm, testOutput: event.target.value })}
              placeholder="Test case output"
              required
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500"
            />
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                {editingProblemId ? 'Update problem' : 'Create problem'}
              </button>
              {editingProblemId ? (
                <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Problem library</h2>
              <p className="mt-2 text-sm text-slate-600">Search, edit, or remove existing problems.</p>
            </div>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, category, or tag"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 caret-slate-900 placeholder:text-slate-500 md:max-w-sm"
            />
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading problems...</div>
            ) : filteredProblems.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No problems match this view.</div>
            ) : (
              filteredProblems.map((problem) => (
                <article key={problem._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{problem.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{problem.difficulty} · {problem.category}</p>
                    {problem.tags?.length ? <p className="mt-2 text-sm text-slate-500">Tags: {problem.tags.join(', ')}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProblem(problem)} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteProblem(problem._id)} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminProblemsPage;