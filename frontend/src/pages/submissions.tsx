'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { submissionAPI } from '@/services/api';
import { useAuthStore } from '@/utils/store';

const SubmissionsPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    loadSubmissions();
  }, [token, router]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const { data } = await submissionAPI.getUserSubmissions(0, 50);
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-8">Submission History</h1>

        {isLoading ? (
          <div className="text-center py-20">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-dark-secondary border border-dark-tertiary rounded-lg">
            No submissions yet
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission: any) => (
              <div
                key={submission._id}
                className="bg-dark-secondary border border-dark-tertiary rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{submission.problemId?.title || 'Unknown Problem'}</h2>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      submission.status === 'SUCCESS'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  Language: {submission.language} | Tests: {submission.testsPassed}/{submission.totalTests}
                </p>
                <pre className="text-xs bg-dark border border-dark-tertiary rounded p-3 overflow-x-auto">
                  {submission.code}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(submission.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubmissionsPage;
