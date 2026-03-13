'use client';

import React from 'react';
import { Recommendation } from '@/types/learning';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onView?: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onView }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return '📚';
      case 'problem':
        return '🎯';
      case 'learning_path':
        return '🛣️';
      default:
        return '✨';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'topic':
        return 'Topic';
      case 'problem':
        return 'Problem';
      case 'learning_path':
        return 'Learning Path';
      default:
        return 'Recommendation';
    }
  };

  return (
    <div className="group bg-gradient-to-br from-white to-slate-50 rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{getTypeIcon(recommendation.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {recommendation.title}
            </h4>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded whitespace-nowrap flex-shrink-0">
              {getTypeLabel(recommendation.type)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">{recommendation.reason}</p>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>📊 {recommendation.difficulty}</span>
            <span>⏱️ {recommendation.estimatedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
