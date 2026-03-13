'use client';

import React from 'react';
import { LearningPack } from '@/types/learning';

interface LearningPackCardProps {
  pack: LearningPack;
  onView?: (id: string) => void;
}

const LearningPackCard: React.FC<LearningPackCardProps> = ({ pack, onView }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-green-400 to-emerald-500';
    if (progress >= 50) return 'from-blue-400 to-cyan-500';
    if (progress >= 25) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Advanced':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden group">
      {/* Header with Icon Background */}
      <div className={`h-32 bg-gradient-to-br ${pack.color} p-4 flex items-start justify-between`}>
        <div className="text-4xl">{pack.icon}</div>
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(pack.difficulty)}`}>
          {pack.difficulty}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
          {pack.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {pack.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{pack.chapters}</div>
            <div className="text-xs text-slate-500">Chapters</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{pack.problemsCount}</div>
            <div className="text-xs text-slate-500">Problems</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{pack.estimatedTime}</div>
            <div className="text-xs text-slate-500">Duration</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Progress</span>
            <span className="text-xs font-bold text-blue-600">{pack.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(pack.progress)} transition-all duration-300`}
              style={{ width: `${pack.progress}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onView?.(pack.id)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {pack.progress === 100 ? 'Review' : 'Continue Learning'}
        </button>
      </div>
    </div>
  );
};

export default LearningPackCard;
