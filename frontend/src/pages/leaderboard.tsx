'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/layouts/MainLayout';
import { leaderboardAPI } from '@/services/api';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const { data } = await leaderboardAPI.getLeaderboard(50);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

        {isLoading ? (
          <div className="text-center py-20">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No leaderboard data available</div>
        ) : (
          <div className="bg-dark-secondary border border-dark-tertiary rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark border-b border-dark-tertiary">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Username</th>
                  <th className="px-6 py-4 text-right">Problems Solved</th>
                  <th className="px-6 py-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user: any, idx: number) => (
                  <tr key={user._id} className="border-t border-dark-tertiary hover:bg-dark transition">
                    <td className="px-6 py-4 font-bold text-lg text-accent">{getMedalEmoji(idx + 1)}</td>
                    <td className="px-6 py-4 font-semibold">{user.username}</td>
                    <td className="px-6 py-4 text-right text-green-400">{user.problemsSolved}</td>
                    <td className="px-6 py-4 text-right font-bold text-yellow-400">{user.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
