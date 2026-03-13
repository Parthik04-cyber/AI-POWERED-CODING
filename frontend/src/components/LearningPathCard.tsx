'use client';

import React from 'react';
import { LearningPath } from '@/types/learning';

interface LearningPathCardProps {
  path: LearningPath;
  onView?: (id: string) => void;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ path, onView }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'from-green-600 to-emerald-600';
      case 'Intermediate':
        return 'from-yellow-600 to-orange-600';
      case 'Advanced':
        return 'from-red-600 to-pink-600';
      default:
        return 'from-blue-600 to-cyan-600';
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
      {/* Gradient Header */}
      <div className={`h-40 bg-gradient-to-br ${getDifficultyColor(path.difficulty)} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white rounded-full"></div>
        </div>
        <div className="relative h-full flex items-center justify-center">
          <span className="text-6xl">{path.icon}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {path.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {path.description}
        </p>

        {/* Skills */}
        {path.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {path.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))}
              {path.skills.length > 3 && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                  +{path.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-sm font-bold text-slate-900">{path.modules}</div>
            <div className="text-xs text-slate-500">Modules</div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{path.estimatedDuration}</div>
            <div className="text-xs text-slate-500">Duration</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Completion</span>
            <span className="text-xs font-bold text-blue-600">{path.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
              style={{ width: `${path.progress}%` }}
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => onView?.(path.id)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Start Path
        </button>
      </div>
    </div>
  );
};

export default LearningPathCard;
