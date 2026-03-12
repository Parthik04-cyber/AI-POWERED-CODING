'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/layouts/MainLayout';
import { authAPI, submissionAPI } from '@/services/api';
import { useAuthStore } from '@/utils/store';

const Profile: React.FC = () => {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [token, router]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [profileRes, submissionsRes] = await Promise.all([
        authAPI.getProfile(),
        submissionAPI.getUserSubmissions(0, 10),
      ]);
      setProfile(profileRes.data);
      setSubmissions(submissionsRes.data.submissions);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">Loading profile...</div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-20 text-red-400">Failed to load profile</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-dark-secondary border border-dark-tertiary rounded-lg p-6 sticky top-24">
              <div className="w-24 h-24 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center text-3xl">
                👤
              </div>
              <h1 className="text-2xl font-bold text-center mb-2">{profile.fullName}</h1>
              <p className="text-gray-400 text-center mb-6">@{profile.username}</p>

              <div className="space-y-4">
                <div className="bg-dark p-3 rounded border border-dark-tertiary">
                  <p className="text-gray-400 text-sm">Problems Solved</p>
                  <p className="text-2xl font-bold text-green-400">{profile.problemsSolved}</p>
                </div>
                <div className="bg-dark p-3 rounded border border-dark-tertiary">
                  <p className="text-gray-400 text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold text-blue-400">{profile.totalSubmissions}</p>
                </div>
                <div className="bg-dark p-3 rounded border border-dark-tertiary">
                  <p className="text-gray-400 text-sm">Score</p>
                  <p className="text-2xl font-bold text-yellow-400">{profile.score}</p>
                </div>
              </div>

              {profile.bio && (
                <div className="mt-4 pt-4 border-t border-dark-tertiary">
                  <p className="text-gray-300">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submissions History */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-6">Recent Submissions</h2>

            {submissions.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-dark-secondary border border-dark-tertiary rounded-lg">
                No submissions yet
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission: any) => (
                  <div key={submission._id} className="bg-dark-secondary border border-dark-tertiary rounded-lg p-4 hover:border-accent transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{submission.problemId?.title}</h3>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        submission.status === 'SUCCESS'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Language: {submission.language} • Tests: {submission.testsPassed}/{submission.totalTests}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
