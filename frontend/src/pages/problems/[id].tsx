'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { problemAPI } from '@/services/api';

const ProblemDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [problem, setProblem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      return;
    }

    loadProblem(id);
  }, [id]);

  useEffect(() => {
    if (!problem?._id) {
      return;
    }

    void router.prefetch(`/editor/${problem._id}`);
  }, [problem?._id, router]);

  const loadProblem = async (problemId: string) => {
    try {
      setIsLoading(true);
      const { data } = await problemAPI.getProblemById(problemId);
      setProblem(data);
    } catch (error) {
      console.error('Failed to load problem details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolveInEditor = async () => {
    if (!problem?._id || isNavigating) {
      return;
    }

    try {
      setIsNavigating(true);
      await router.push(`/editor/${problem._id}`);
    } catch (error) {
      console.error('Failed to navigate to editor:', error);
      setIsNavigating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="text-center py-20">Loading problem...</div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout showFooter={false}>
        <div className="text-center py-20 text-red-400">Problem not found</div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="mb-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{problem.title}</h1>
        <div className="mb-5 flex gap-2">
          <span className="px-3 py-1 rounded bg-blue-900 text-blue-200">{problem.difficulty}</span>
          <span className="px-3 py-1 rounded bg-gray-900 text-gray-300">{problem.category}</span>
        </div>

        <h2 className="mb-2 text-base font-semibold text-slate-900">Description</h2>
        <p className="mb-5 text-sm leading-6 text-slate-700">{problem.description}</p>

        <h2 className="mb-2 text-base font-semibold text-slate-900">Examples</h2>
        <div className="mb-6 space-y-2.5">
          {(problem.examples || []).map((example: any, index: number) => (
            <div key={index} className="rounded-lg border border-dark-tertiary bg-dark-secondary p-3">
              <p className="mb-1 font-mono text-sm text-white">Input: {example.input}</p>
              <p className="font-mono text-sm text-white">Output: {example.output}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSolveInEditor}
          disabled={isNavigating}
          className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isNavigating ? 'Opening Editor...' : 'Solve In Editor'}
        </button>
      </div>
    </Layout>
  );
};

export default ProblemDetailPage;
