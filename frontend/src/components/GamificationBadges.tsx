'use client';

import React from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: Date;
  progress?: number; // 0-100
}

interface GamificationBadgesProps {
  badges?: Badge[];
  earnedPoints?: number;
  currentStreak?: number;
}

const GamificationBadges: React.FC<GamificationBadgesProps> = ({
  badges = defaultBadges,
  earnedPoints = 2450,
  currentStreak = 7,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
      {/* Header */}
      <h3 className="text-xl font-bold text-slate-900 mb-6">Achievements & Badges</h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center border border-yellow-200">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-lg font-bold text-yellow-900">{earnedPoints}</div>
          <div className="text-xs text-yellow-700">Points Earned</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border border-orange-200">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-lg font-bold text-orange-900">{currentStreak}</div>
          <div className="text-xs text-orange-700">Day Streak</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-lg font-bold text-blue-900">{badges.filter((b) => b.unlockedAt).length}</div>
          <div className="text-xs text-blue-700">Badges Unlocked</div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-lg p-4 text-center border-2 transition-all duration-200 ${
              badge.unlockedAt
                ? 'bg-white border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className={`text-3xl mb-2 ${badge.unlockedAt ? '' : 'opacity-50 grayscale'}`}>
              {badge.emoji}
            </div>
            <div className="text-xs font-semibold text-slate-900 mb-1">{badge.name}</div>
            <div className="text-xs text-slate-500 line-clamp-2">{badge.description}</div>

            {badge.progress !== undefined && (
              <div className="mt-2">
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            )}

            {badge.unlockedAt && (
              <div className="mt-2 text-xs text-blue-600 font-semibold">✓ Unlocked</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const defaultBadges: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Solve your first problem',
    emoji: '👶',
    unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Problem Solver',
    description: 'Solve 10 problems',
    emoji: '🧩',
    unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    progress: 80,
  },
  {
    id: '3',
    name: 'Code Master',
    description: 'Solve 50 problems',
    emoji: '🧙',
    progress: 60,
  },
  {
    id: '4',
    name: 'Speed Demon',
    description: 'Solve 5 problems in one day',
    emoji: '⚡',
    unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    name: 'Consistent Coder',
    description: '7-day coding streak',
    emoji: '🔥',
    progress: 95,
  },
  {
    id: '6',
    name: 'Algorithm Expert',
    description: 'Complete DSA Master Path',
    emoji: '🎓',
    progress: 45,
  },
];

export default GamificationBadges;
