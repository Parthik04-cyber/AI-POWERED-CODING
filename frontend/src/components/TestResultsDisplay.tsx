import React from 'react';

interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  executionTime?: number;
  memory?: number;
}

interface TestResultsDisplayProps {
  results: TestCaseResult[] | undefined;
  status: string;
  testsPassed: number;
  totalTests: number;
  isLoading?: boolean;
}

export const TestResultsDisplay: React.FC<TestResultsDisplayProps> = ({
  results,
  status,
  testsPassed,
  totalTests,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <div className="animate-pulse">
          <div className="mb-2 h-6 w-32 rounded bg-dark-tertiary"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded border border-dark-tertiary bg-dark"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isAccepted = status === 'SUCCESS' && testsPassed === totalTests;
  const statusColor = isAccepted ? 'text-green-400' : status === 'PENDING' ? 'text-yellow-400' : 'text-red-400';
  const statusBgColor = isAccepted
    ? 'bg-green-500/10 border-green-500/30'
    : status === 'PENDING'
      ? 'bg-yellow-500/10 border-yellow-500/30'
      : 'bg-red-500/10 border-red-500/30';

  return (
    <div className="space-y-4 p-4">
      {/* Summary Status */}
      <div className={`rounded-lg border ${statusBgColor} p-3`}>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-300">Status</span>
          <span className={`font-bold ${statusColor}`}>{isAccepted ? 'Accepted' : 'Wrong Answer'}</span>
        </div>
        <div className="text-sm text-slate-400">
          {testsPassed} / {totalTests} test cases passed
        </div>
      </div>

      {/* Test Case Results */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">Test Cases</h3>

        {!results || results.length === 0 ? (
          <div className="rounded border border-dark-tertiary bg-dark p-3 text-center text-sm text-slate-400">
            No test case results available
          </div>
        ) : (
          results.map((testCase, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 transition-all ${
                testCase.passed
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              {/* Test Case Header */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">
                  Test Case {idx + 1}
                </span>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                    testCase.passed
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {testCase.passed ? '✓ Passed' : '✗ Failed'}
                </span>
              </div>

              {/* Input */}
              <div className="mb-2 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Input:
                </label>
                <div className="mr-2 max-h-20 overflow-y-auto rounded bg-black/20 p-2 font-mono text-xs text-slate-300">
                  {testCase.input || '(empty)'}
                </div>
              </div>

              {/* Expected Output */}
              <div className="mb-2 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Expected Output:
                </label>
                <div className="mr-2 max-h-20 overflow-y-auto rounded bg-black/20 p-2 font-mono text-xs text-slate-300">
                  {testCase.expected || '(empty)'}
                </div>
              </div>

              {/* Actual Output */}
              <div className="mb-2 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Your Output:
                </label>
                <div className="mr-2 max-h-20 overflow-y-auto rounded bg-black/20 p-2 font-mono text-xs text-slate-300">
                  {testCase.actual || '(no output)'}
                </div>
              </div>

              {/* Error Message */}
              {testCase.error && (
                <div className="mb-2 space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-red-400">
                    Error:
                  </label>
                  <div className="rounded bg-red-500/10 p-2 font-mono text-xs text-red-300">
                    {testCase.error}
                  </div>
                </div>
              )}

              {/* Execution Metrics */}
              {(testCase.executionTime !== undefined || testCase.memory !== undefined) && (
                <div className="flex gap-3 text-xs text-slate-400">
                  {testCase.executionTime !== undefined && (
                    <span>Time: {(testCase.executionTime * 1000).toFixed(2)} ms</span>
                  )}
                  {testCase.memory !== undefined && (
                    <span>Memory: {(testCase.memory / 1024).toFixed(2)} MB</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
