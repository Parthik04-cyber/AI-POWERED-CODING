'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { problemAPI } from '@/services/api';

const ProblemDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [problem, setProblem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      return;
    }

    loadProblem(id);
  }, [id]);

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

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">Loading problem...</div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout>
        <div className="text-center py-20 text-red-400">Problem not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-4">{problem.title}</h1>
        <div className="flex gap-2 mb-6">
          <span className="px-3 py-1 rounded bg-blue-900 text-blue-200">{problem.difficulty}</span>
          <span className="px-3 py-1 rounded bg-gray-900 text-gray-300">{problem.category}</span>
        </div>

        <h2 className="text-xl font-bold mb-3">Description</h2>
        <p className="text-gray-300 mb-6">{problem.description}</p>

        <h2 className="text-xl font-bold mb-3">Examples</h2>
        <div className="space-y-3 mb-8">
          {(problem.examples || []).map((example: any, index: number) => (
            <div key={index} className="bg-dark-secondary border border-dark-tertiary rounded p-4">
              <p className="font-mono text-sm mb-1">Input: {example.input}</p>
              <p className="font-mono text-sm">Output: {example.output}</p>
            </div>
          ))}
        </div>

        <Link
          href={`/editor/${problem._id}`}
          className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg"
        >
          Solve In Editor
        </Link>
      </div>
    </Layout>
  );
};

export default ProblemDetailPage;
