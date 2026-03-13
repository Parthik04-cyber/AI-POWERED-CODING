'use client';

import React from 'react';
import { MiniTest } from '@/types/learning';

interface MiniTestCardProps {
  test: MiniTest;
  onTake?: (id: string) => void;
}

const MiniTestCard: React.FC<MiniTestCardProps> = ({ test, onTake }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Hard':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="group bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex-1">
          {test.title}
        </h4>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded border whitespace-nowrap flex-shrink-0 ${getDifficultyColor(test.difficulty)}`}>
          {test.difficulty}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">{test.topic}</p>

      <div className="space-y-2 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>📋 {test.questionsCount} Questions</span>
          <span>⏱️ {test.timeLimit}min</span>
        </div>
        <div className="text-xs text-slate-600">
          📈 Avg Score: <span className="font-semibold text-blue-600">{test.averageScore}%</span>
        </div>
      </div>

      <button
        onClick={() => onTake?.(test.id)}
        className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs font-semibold rounded transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Take Test
      </button>
    </div>
  );
};

export default MiniTestCard;
