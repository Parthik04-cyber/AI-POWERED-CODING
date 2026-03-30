import React, { useState } from 'react';

interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  executionTime?: number;
  memory?: number;
}

interface TestCaseTabsProps {
  testResults: TestCaseResult[];
  status: string;
  testsPassed: number;
  totalTests: number;
  isLoading?: boolean;
  caseType?: 'sample' | 'submission' | 'custom';
  summaryExecutionTime?: number;
  summaryMemory?: number;
}

export const TestCaseTabs: React.FC<TestCaseTabsProps> = ({
  testResults,
  status,
  testsPassed,
  totalTests,
  isLoading = false,
  caseType = 'sample',
  summaryExecutionTime,
  summaryMemory,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-32 rounded-md bg-dark-tertiary"></div>
          <div className="h-36 rounded-md bg-dark-tertiary"></div>
        </div>
      </div>
    );
  }

  if (!testResults || testResults.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-center text-sm text-slate-400">
        No test results available
      </div>
    );
  }

  const isAccepted = status === 'SUCCESS' && testsPassed === totalTests;
  const currentTest = testResults[activeTab];
  const statusDetails = (() => {
    if (isAccepted) {
      return {
        label: 'Accepted',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30',
      };
    }

    if (status === 'PENDING') {
      return {
        label: 'Pending',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      };
    }

    if (status === 'COMPILE_ERROR') {
      return {
        label: 'Compile Error',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30',
      };
    }

    if (status === 'RUNTIME_ERROR') {
      return {
        label: 'Runtime Error',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30',
      };
    }

    if (status === 'TIME_LIMIT_EXCEEDED') {
      return {
        label: 'Time Limit Exceeded',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/30',
      };
    }

    return {
      label: 'Wrong Answer',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
    };
  })();

  return (
    <div className="flex h-full flex-col bg-dark">
      {/* Status Bar */}
      <div className={`border-b ${statusDetails.bgColor} border-dark-tertiary px-3 py-2.5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Status</div>
            <div className={`text-base font-bold ${statusDetails.color}`}>
              {statusDetails.label}
            </div>
          </div>

          <div className="ml-auto text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Test Cases</div>
            <div className={`text-base font-bold ${testsPassed === totalTests ? 'text-green-400' : 'text-orange-400'}`}>
              {testsPassed} / {totalTests}
            </div>
          </div>

          {(summaryExecutionTime !== undefined || summaryMemory !== undefined) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              {summaryExecutionTime !== undefined && (
                <span>
                  Runtime: {(summaryExecutionTime * 1000).toFixed(2)} ms
                </span>
              )}
              {summaryMemory !== undefined && (
                <span>
                  Memory: {(summaryMemory / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test Case Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-dark-tertiary px-2 py-1.5">
        {testResults.map((test, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all sm:text-sm ${
              activeTab === idx
                ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                : `border-dark-tertiary text-slate-400 hover:bg-dark-tertiary hover:text-slate-300`
            }`}
          >
            <span>Case {idx + 1}</span>
            {test.passed ? (
              <span className="text-green-400">✓</span>
            ) : (
              <span className="text-red-400">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Test Case Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {/* Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Input</label>
            <div className="max-h-24 overflow-y-auto rounded-md border border-dark-tertiary bg-black/30 p-2.5 font-mono text-sm leading-6 text-slate-200">
              {currentTest.input ? (
                <pre className="whitespace-pre-wrap break-words">{currentTest.input}</pre>
              ) : (
                <span className="text-slate-400">(empty)</span>
              )}
            </div>
          </div>

          {/* Expected Output */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Expected Output</label>
            <div className="max-h-24 overflow-y-auto rounded-md border border-green-500/20 bg-green-500/5 p-2.5 font-mono text-sm leading-6 text-slate-200">
              {currentTest.expected ? (
                <pre className="whitespace-pre-wrap break-words">{currentTest.expected}</pre>
              ) : (
                <span className="text-slate-400">(empty)</span>
              )}
            </div>
          </div>

          {/* Actual Output */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Your Output</label>
            <div
              className={`max-h-24 overflow-y-auto rounded-md border p-2.5 font-mono text-sm leading-6 text-slate-200 ${
                currentTest.passed
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-red-500/20 bg-red-500/5'
              }`}
            >
              {currentTest.actual ? (
                <pre className="whitespace-pre-wrap break-words">{currentTest.actual}</pre>
              ) : (
                <span className="text-slate-400">(no output)</span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {currentTest.error && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-red-400">Error</label>
              <div className="max-h-24 overflow-y-auto rounded-md border border-red-500/30 bg-red-500/10 p-2.5 font-mono text-sm leading-6 text-red-300">
                <pre className="whitespace-pre-wrap break-words">{currentTest.error}</pre>
              </div>
            </div>
          )}

          {/* Execution Metrics */}
          {(currentTest.executionTime !== undefined || currentTest.memory !== undefined) && (
            <div className="rounded-md border border-dark-tertiary bg-dark-secondary p-2.5">
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                {currentTest.executionTime !== undefined && (
                  <div>
                    <span className="font-semibold text-slate-300">Time:</span> {(currentTest.executionTime * 1000).toFixed(2)}
                    ms
                  </div>
                )}
                {currentTest.memory !== undefined && (
                  <div>
                    <span className="font-semibold text-slate-300">Memory:</span> {(currentTest.memory / 1024).toFixed(2)}
                    MB
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Case Type Badge */}
          <div className="flex justify-end">
            <span className="inline-block rounded-full bg-slate-700/50 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
              {caseType === 'sample' ? 'Sample Cases' : caseType === 'submission' ? 'Submission Cases' : 'Custom Cases'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
