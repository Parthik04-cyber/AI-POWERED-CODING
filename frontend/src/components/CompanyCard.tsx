'use client';

import React from 'react';
import { CompanyPack } from '@/types/learning';

interface CompanyCardProps {
  company: CompanyPack;
  onView?: (companyName: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onView }) => {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      {/* Header with Company Logo Area */}
      <div className="h-24 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
          <span className="text-3xl font-bold text-blue-600">{company.company.charAt(0)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
          {company.company}
        </h3>
        <p className="text-xs text-slate-400 mb-4">Updated {company.lastUpdated}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-lg font-bold text-slate-900">{company.topicsCount}</div>
            <div className="text-xs text-slate-500">Topics</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{company.problemsCount}</div>
            <div className="text-xs text-slate-500">Problems</div>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="mb-4">
          <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 rounded-lg">
            {company.difficulty}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Progress</span>
            <span className="text-xs font-bold text-blue-600">{company.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
              style={{ width: `${company.progress}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onView?.(company.company)}
          className="w-full py-2.5 px-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-lg transition-all duration-200"
        >
          Explore Pack
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
