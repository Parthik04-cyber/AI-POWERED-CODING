'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/layouts/MainLayout';
import { problemAPI } from '@/services/api';
import { useProblemStore } from '@/utils/store';

const Problems: React.FC = () => {
  const { problems, isLoading, setProblems, setIsLoading } = useProblemStore();
  const [difficulty, setDifficulty] = useState('');
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 10;

  useEffect(() => {
    loadProblems();
  }, [difficulty, skip]);

  const loadProblems = async () => {
    try {
      setIsLoading(true);
      const { data } = await problemAPI.getAllProblems(skip, limit, difficulty);
      setProblems(data.problems);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load problems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-900 text-green-200';
      case 'Medium':
        return 'bg-yellow-900 text-yellow-200';
      case 'Hard':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-900 text-gray-200';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-8">Coding Problems</h1>

        <div className="mb-8 flex gap-4">
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setSkip(0);
            }}
            className="px-4 py-2 border border-dark-tertiary rounded-lg bg-dark-secondary text-white"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-20">Loading problems...</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No problems found</div>
        ) : (
          <>
            <div className="space-y-4">
              {problems.map((problem: any) => (
                <Link key={problem._id} href={`/editor/${problem._id}`}>
                  <div className="p-6 bg-dark-secondary border border-dark-tertiary rounded-lg hover:border-accent transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
                        <p className="text-gray-400 mb-4">{problem.description.substring(0, 150)}...</p>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-gray-900 text-gray-300">
                            {problem.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{problem.submissionCount} submissions</p>
                        <p className="text-sm text-green-400">
                          {problem.acceptedCount ? `${Math.round((problem.acceptedCount / problem.submissionCount) * 100)}%` : '0%'} accepted
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <p className="text-gray-400">
                Showing {skip + 1} - {Math.min(skip + limit, total)} of {total}
              </p>
              <button
                onClick={() => setSkip(skip + limit)}
                disabled={skip + limit >= total}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Problems;
