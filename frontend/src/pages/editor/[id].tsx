'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Editor from '@monaco-editor/react';
import Layout from '@/layouts/MainLayout';
import { executeAPI, problemAPI, submissionAPI } from '@/services/api';
import { useEditorStore, useAuthStore } from '@/utils/store';
import { TestCaseTabs } from '@/components/TestCaseTabs';

type ResultType = 'sample' | 'submission' | 'custom';
type OutputView = 'testcases' | 'custom';
type DragMode = 'columns' | 'rows' | null;

interface CustomRunResult {
  input: string;
  output: string;
  error: string;
  status: string;
  executionTime?: number;
  memory?: number;
}

const EditorPage: React.FC = () => {
  const DEFAULT_LEFT_WIDTH_RATIO = 0.44;
  const DEFAULT_EDITOR_HEIGHT_RATIO = 0.6;
  const SPLIT_HANDLE_SIZE = 8;
  const MIN_LEFT_PANEL_WIDTH = 360;
  const MIN_RIGHT_PANEL_WIDTH = 430;
  const MIN_EDITOR_HEIGHT = 180;
  const MIN_RESULTS_HEIGHT = 190;

  const router = useRouter();
  const { id } = router.query;
  const { token, initialized } = useAuthStore();
  const { code, language, output, isRunning, setCode, setLanguage, setOutput, setIsRunning } = useEditorStore();

  const [problem, setProblem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);
  const [resultType, setResultType] = useState<ResultType>('sample');
  const [outputView, setOutputView] = useState<OutputView>('testcases');
  const [customInput, setCustomInput] = useState('');
  const [customRunResult, setCustomRunResult] = useState<CustomRunResult | null>(null);

  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [leftPanelWidthPx, setLeftPanelWidthPx] = useState<number | null>(null);
  const [editorHeightPx, setEditorHeightPx] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);

  const workspaceSplitRef = useRef<HTMLDivElement | null>(null);
  const editorSplitRef = useRef<HTMLDivElement | null>(null);

  const clampLeftPanelWidth = (rawWidth: number): number => {
    const container = workspaceSplitRef.current;
    if (!container) {
      return Math.max(MIN_LEFT_PANEL_WIDTH, rawWidth);
    }

    const maxWidth = Math.max(
      MIN_LEFT_PANEL_WIDTH,
      container.clientWidth - MIN_RIGHT_PANEL_WIDTH - SPLIT_HANDLE_SIZE,
    );

    return Math.min(Math.max(rawWidth, MIN_LEFT_PANEL_WIDTH), maxWidth);
  };

  const clampEditorHeight = (rawHeight: number): number => {
    const container = editorSplitRef.current;
    if (!container) {
      return Math.max(MIN_EDITOR_HEIGHT, rawHeight);
    }

    const maxEditorHeight = Math.max(
      MIN_EDITOR_HEIGHT,
      container.clientHeight - MIN_RESULTS_HEIGHT - SPLIT_HANDLE_SIZE,
    );

    return Math.min(Math.max(rawHeight, MIN_EDITOR_HEIGHT), maxEditorHeight);
  };

  const startColumnDividerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragMode('columns');
  };

  const startRowDividerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragMode('rows');
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const updateLayoutMode = () => {
      setIsDesktopLayout(mediaQuery.matches);
    };

    updateLayoutMode();
    mediaQuery.addEventListener('change', updateLayoutMode);

    return () => {
      mediaQuery.removeEventListener('change', updateLayoutMode);
    };
  }, []);

  useEffect(() => {
    if (isDesktopLayout) {
      return;
    }

    setLeftPanelWidthPx(null);
    setEditorHeightPx(null);
  }, [isDesktopLayout]);

  useEffect(() => {
    if (!isDesktopLayout) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (leftPanelWidthPx !== null) {
        setLeftPanelWidthPx((currentWidth) => {
          if (currentWidth === null) {
            return currentWidth;
          }

          return clampLeftPanelWidth(currentWidth);
        });
      }

      if (editorHeightPx !== null) {
        setEditorHeightPx((currentHeight) => {
          if (currentHeight === null) {
            return currentHeight;
          }

          return clampEditorHeight(currentHeight);
        });
      }
    });

    if (workspaceSplitRef.current) {
      resizeObserver.observe(workspaceSplitRef.current);
    }

    if (editorSplitRef.current) {
      resizeObserver.observe(editorSplitRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [editorHeightPx, isDesktopLayout, leftPanelWidthPx]);

  useEffect(() => {
    if (!dragMode) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (dragMode === 'columns') {
        const workspace = workspaceSplitRef.current;
        if (!workspace) {
          return;
        }

        const rect = workspace.getBoundingClientRect();
        const requestedWidth = event.clientX - rect.left;
        setLeftPanelWidthPx(clampLeftPanelWidth(requestedWidth));
        return;
      }

      const editorContainer = editorSplitRef.current;
      if (!editorContainer) {
        return;
      }

      const rect = editorContainer.getBoundingClientRect();
      const requestedHeight = event.clientY - rect.top;
      setEditorHeightPx(clampEditorHeight(requestedHeight));
    };

    const stopDragging = () => {
      setDragMode(null);
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = dragMode === 'columns' ? 'col-resize' : 'row-resize';

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [dragMode]);

  const statusText = useMemo(() => {
    if (!output) {
      return 'Ready';
    }

    return output;
  }, [output]);

  const summaryExecutionTime = useMemo(() => {
    if (!testResults) {
      return undefined;
    }

    if (typeof testResults.executionTime === 'number') {
      return testResults.executionTime;
    }

    if (!Array.isArray(testResults.testResults)) {
      return undefined;
    }

    return testResults.testResults.reduce((acc: number, result: any) => {
      return acc + (typeof result.executionTime === 'number' ? result.executionTime : 0);
    }, 0);
  }, [testResults]);

  const summaryMemory = useMemo(() => {
    if (!testResults) {
      return undefined;
    }

    if (typeof testResults.memory === 'number') {
      return testResults.memory;
    }

    if (!Array.isArray(testResults.testResults)) {
      return undefined;
    }

    return testResults.testResults.reduce((acc: number, result: any) => {
      if (typeof result.memory !== 'number') {
        return acc;
      }

      return Math.max(acc, result.memory);
    }, 0);
  }, [testResults]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!token) {
      const nextPath = typeof router.asPath === 'string' ? router.asPath : `/editor/${id}`;
      void router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (!id || typeof id !== 'string') {
      return;
    }

    void loadProblem(id);
  }, [id, initialized, token, router]);

  const loadProblem = async (problemId: string) => {
    try {
      setIsLoading(true);
      const { data } = await problemAPI.getProblemById(problemId);
      setProblem(data);
      if (!code) {
        setCode(getTemplateCode(language));
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateCode = (lang: string): string => {
    const templates: Record<string, string> = {
      javascript: '// Write your solution here\nfunction solution(n) {\n  // TODO: implement\n}',
      python: '# Write your solution here\ndef solution(n):\n    # TODO: implement\n    pass',
      java: 'public class Solution {\n    public static void main(String[] args) {\n        // TODO: implement\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: implement\n    return 0;\n}',
    };
    return templates[lang] || '';
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(getTemplateCode(newLang));
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      if (!id || typeof id !== 'string') {
        setOutput('Error: Invalid problem ID');
        return;
      }

      const { data } = await submissionAPI.runCodeWithSamples({
        problemId: id,
        code,
        language,
      });

      setResultType('sample');
      setOutputView('testcases');
      setTestResults(data);
      setOutput('Sample test cases executed');
    } catch (error: any) {
      setOutput(`Error: ${error.response?.data?.error || 'Run failed'}`);
      setTestResults(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsRunning(true);
      if (!id || typeof id !== 'string') {
        setOutput('Error: Invalid problem ID');
        return;
      }

      const { data } = await submissionAPI.submitCode({
        problemId: id,
        code,
        language,
      });

      setResultType('submission');
      setOutputView('testcases');
      setTestResults(data);
      setOutput('Submission received, evaluating...');
      await pollSubmissionResult(data._id);
    } catch (error: any) {
      setOutput(`Error: ${error.response?.data?.error || 'Submission failed'}`);
      setTestResults(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustomInput = async () => {
    try {
      setIsRunning(true);
      const { data } = await executeAPI.runCode({
        code,
        language,
        input: customInput,
      });

      const statusCode = data?.status?.id;
      const hasPassed = statusCode === 3;
      const errorText = data?.compile_output || data?.runtime_error || '';
      const rawOutput = typeof data?.stdout === 'string' ? data.stdout : '';

      setCustomRunResult({
        input: customInput,
        output: rawOutput,
        error: errorText,
        status: data?.status?.description || (hasPassed ? 'Accepted' : 'Execution Error'),
        executionTime: typeof data?.time === 'number' ? data.time : undefined,
        memory: typeof data?.memory === 'number' ? data.memory : undefined,
      });

      setResultType('custom');
      setOutputView('custom');
      setOutput(hasPassed ? 'Custom input executed' : 'Custom run completed with errors');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Custom input run failed';
      setCustomRunResult({
        input: customInput,
        output: '',
        error: message,
        status: 'Execution Error',
      });
      setResultType('custom');
      setOutputView('custom');
      setOutput(`Error: ${message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const pollSubmissionResult = async (submissionId: string) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const { data } = await submissionAPI.getSubmissionById(submissionId);
      setTestResults(data);

      if (data.status !== 'PENDING') {
        const isAccepted = data.status === 'SUCCESS' && data.testsPassed === data.totalTests;
        setOutput(isAccepted ? 'All tests passed!' : `${data.testsPassed}/${data.totalTests} tests passed`);
        return;
      }
    }
  };

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="text-center py-20">Loading problem...</div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout showFooter={false}>
        <div className="text-center py-20 text-red-400">Problem not found</div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-4.2rem)] w-full overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
        <div
          ref={workspaceSplitRef}
          className="grid h-full min-h-0 gap-2"
          style={
            isDesktopLayout
              ? {
                  gridTemplateColumns:
                    leftPanelWidthPx === null
                      ? `minmax(${MIN_LEFT_PANEL_WIDTH}px, ${Math.round(DEFAULT_LEFT_WIDTH_RATIO * 100)}%) ${SPLIT_HANDLE_SIZE}px minmax(${MIN_RIGHT_PANEL_WIDTH}px, 1fr)`
                      : `${leftPanelWidthPx}px ${SPLIT_HANDLE_SIZE}px minmax(${MIN_RIGHT_PANEL_WIDTH}px, 1fr)`,
                }
              : {
                  gridTemplateRows: 'minmax(280px, 40%) minmax(400px, 1fr)',
                }
          }
        >
          <section className="flex min-h-0 flex-col rounded-xl border border-dark-tertiary bg-dark-secondary text-gray-100 shadow-card">
            <header className="border-b border-dark-tertiary px-3 py-2.5 sm:px-4">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-900 px-2.5 py-0.5 text-xs font-semibold text-blue-200">{problem.difficulty}</span>
                <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-100">{problem.category}</span>
              </div>
              <h1 className="text-lg font-bold leading-tight text-white sm:text-xl">{problem.title}</h1>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto scroll-smooth px-3 py-3 sm:px-4">
              <section>
                <h2 className="mb-1.5 text-sm font-semibold text-slate-200">Description</h2>
                <div className="rounded-lg border border-dark-tertiary bg-dark px-3 py-2.5">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-100">{problem.description}</p>
                </div>
              </section>

              <section>
                <h2 className="mb-1.5 text-sm font-semibold text-slate-200">Examples</h2>
                <div className="space-y-2.5">
                  {problem.examples?.length ? (
                    problem.examples.map((example: any, idx: number) => (
                      <article key={idx} className="rounded-lg border border-dark-tertiary bg-dark p-3">
                        <p className="mb-1.5 font-mono text-xs text-gray-100 sm:text-sm">
                          <span className="font-semibold text-emerald-300">Input:</span> {example.input || '(empty)'}
                        </p>
                        <p className="font-mono text-xs text-gray-100 sm:text-sm">
                          <span className="font-semibold text-sky-300">Output:</span> {example.output || '(empty)'}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dark-tertiary bg-dark px-3 py-2.5 text-sm text-slate-300">
                      No examples available for this problem.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-1.5 text-sm font-semibold text-slate-200">Constraints</h2>
                <div className="rounded-lg border border-dark-tertiary bg-dark px-3 py-2.5">
                  {problem.constraints?.length ? (
                    <ul className="space-y-1.5 text-sm leading-6 text-gray-100">
                      {problem.constraints.map((constraint: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 text-xs text-slate-400">•</span>
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-300">No constraints provided.</p>
                  )}
                </div>
              </section>
            </div>
          </section>

          {isDesktopLayout && (
            <button
              type="button"
              aria-label="Resize problem and editor panels"
              aria-orientation="vertical"
              onPointerDown={startColumnDividerDrag}
              className="group relative hidden cursor-col-resize rounded-md border border-dark-tertiary bg-dark-secondary lg:block"
            >
              <span className="pointer-events-none absolute bottom-8 left-1/2 top-8 w-1 -translate-x-1/2 rounded-full bg-slate-600/80 transition group-hover:bg-slate-400 group-focus-visible:bg-slate-300" />
            </button>
          )}

          <section className="flex min-h-0 flex-col rounded-xl border border-dark-tertiary bg-dark-secondary text-gray-100 shadow-card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-dark-tertiary px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="min-w-[135px] rounded-md border border-dark-tertiary bg-dark px-2.5 py-1.5 text-sm text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>

                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run'}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isRunning ? 'Submitting...' : 'Submit'}
                </button>
              </div>

              <span className="max-w-full truncate text-xs font-medium text-slate-300">{statusText}</span>
            </header>

            <div
              ref={editorSplitRef}
              className="grid min-h-0 flex-1"
              style={{
                gridTemplateRows:
                  editorHeightPx === null
                    ? `minmax(${MIN_EDITOR_HEIGHT}px, ${Math.round(DEFAULT_EDITOR_HEIGHT_RATIO * 100)}%) ${SPLIT_HANDLE_SIZE}px minmax(${MIN_RESULTS_HEIGHT}px, 1fr)`
                    : `${editorHeightPx}px ${SPLIT_HANDLE_SIZE}px minmax(${MIN_RESULTS_HEIGHT}px, 1fr)`,
              }}
            >
              <div className="min-h-0 overflow-hidden border-b border-dark-tertiary">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'Monaco, Menlo, Courier New',
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>

              <button
                type="button"
                aria-label="Resize editor and output panels"
                aria-orientation="horizontal"
                onPointerDown={startRowDividerDrag}
                className="group relative block cursor-row-resize border-y border-dark-tertiary bg-dark-secondary focus:outline-none"
              >
                <span className="pointer-events-none absolute inset-x-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-600/80 transition group-hover:bg-slate-400 group-focus-visible:bg-slate-300" />
              </button>

              <div className="min-h-0 overflow-hidden border-t border-dark-tertiary bg-dark">
                <div className="border-b border-dark-tertiary px-2 py-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setOutputView('testcases')}
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                        outputView === 'testcases'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                          : 'border-dark-tertiary bg-dark-secondary text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Test Cases
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutputView('custom')}
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                        outputView === 'custom'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                          : 'border-dark-tertiary bg-dark-secondary text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Custom Input
                    </button>
                  </div>
                </div>

                {outputView === 'testcases' ? (
                  testResults && testResults.testResults ? (
                    <TestCaseTabs
                      testResults={testResults.testResults}
                      status={testResults.status}
                      testsPassed={testResults.testsPassed}
                      totalTests={testResults.totalTests}
                      isLoading={isRunning && testResults.status === 'PENDING'}
                      caseType={resultType}
                      summaryExecutionTime={summaryExecutionTime}
                      summaryMemory={summaryMemory}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 py-6 text-center text-sm text-slate-400">
                      {isRunning ? (
                        <div className="space-y-2">
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-slate-200"></div>
                          <p>Running code...</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-sm font-semibold text-slate-200">Run or submit your code</p>
                          <p className="text-xs">Run executes sample test cases.</p>
                          <p className="text-xs">Submit evaluates hidden test cases.</p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="h-full overflow-y-auto scroll-smooth p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                          Custom Input
                        </label>
                        <textarea
                          value={customInput}
                          onChange={(event) => setCustomInput(event.target.value)}
                          placeholder="Enter stdin for your program"
                          className="h-28 w-full resize-y rounded-md border border-dark-tertiary bg-black/30 p-2.5 font-mono text-sm text-slate-100"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-400">
                          Uses stdin execution mode for quick debugging.
                        </p>
                        <button
                          type="button"
                          onClick={handleRunCustomInput}
                          disabled={isRunning}
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isRunning ? 'Running...' : 'Run Custom Input'}
                        </button>
                      </div>

                      {customRunResult ? (
                        <div className="space-y-3 rounded-lg border border-dark-tertiary bg-dark-secondary p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-200">Status: {customRunResult.status}</span>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                              {customRunResult.executionTime !== undefined && (
                                <span>Runtime: {(customRunResult.executionTime * 1000).toFixed(2)} ms</span>
                              )}
                              {customRunResult.memory !== undefined && (
                                <span>Memory: {(customRunResult.memory / 1024).toFixed(2)} MB</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-300">Your Output</label>
                            <div className="max-h-36 overflow-y-auto rounded-md border border-dark-tertiary bg-black/40 p-2.5 font-mono text-sm text-slate-100">
                              <pre className="whitespace-pre-wrap break-words">{customRunResult.output || '(no output)'}</pre>
                            </div>
                          </div>

                          {customRunResult.error && (
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-red-400">Error</label>
                              <div className="max-h-32 overflow-y-auto rounded-md border border-red-500/30 bg-red-500/10 p-2.5 font-mono text-sm text-red-200">
                                <pre className="whitespace-pre-wrap break-words">{customRunResult.error}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed border-dark-tertiary bg-dark-secondary/50 px-3 py-4 text-center text-sm text-slate-400">
                          Run custom input to inspect raw program output.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;
