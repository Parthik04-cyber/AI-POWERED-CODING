'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Editor from '@monaco-editor/react';
import Layout from '@/layouts/MainLayout';
import { executeAPI, problemAPI, submissionAPI } from '@/services/api';
import { useEditorStore, useAuthStore } from '@/utils/store';

const EditorPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { token, initialized } = useAuthStore();
  const { code, language, output, isRunning, setCode, setLanguage, setOutput, setIsRunning } = useEditorStore();

  const [problem, setProblem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customInput, setCustomInput] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

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
      setTestResults(data);
      setOutput(`Submission ID: ${data._id}\nStatus: ${data.status}\nEvaluating test cases...`);
      await pollSubmissionResult(data._id);
    } catch (error: any) {
      setOutput(`Error: ${error.response?.data?.error || 'Submission failed'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      const { data } = await executeAPI.runCode({
        code,
        language,
        input: customInput,
      });

      const runOutput = data.stdout || data.compile_output || data.runtime_error || 'No output';
      setOutput(`Run Result: ${data.status?.description || 'Unknown'}\n\n${runOutput}`);
    } catch (error: any) {
      setOutput(`Error: ${error.response?.data?.error || 'Code run failed'}`);
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
        const feedback = data.aiFeedback
          ? `\n\nAI Feedback:\n${data.aiFeedback.complexity || ''}\n${(data.aiFeedback.suggestions || []).join('\n- ')}`
          : '';

        setOutput(
          `Submission ID: ${data._id}\nStatus: ${data.status}\nTests: ${data.testsPassed}/${data.totalTests}${feedback}`
        );
        return;
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">Loading problem...</div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout>
        <div className="text-center py-20 text-red-400">Problem not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
        <div className="grid grid-cols-1 gap-4 lg:h-[calc(100vh-9.5rem)] lg:grid-cols-[minmax(420px,1fr)_minmax(520px,1.25fr)]">
          {/* Problem Panel */}
          <section className="flex min-h-0 flex-col rounded-2xl border border-dark-tertiary bg-dark-secondary text-gray-100 shadow-card">
            <header className="border-b border-dark-tertiary px-5 py-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-blue-200">{problem.difficulty}</span>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100">{problem.category}</span>
              </div>
              <h1 className="text-2xl font-bold leading-tight text-white md:text-3xl">{problem.title}</h1>
            </header>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <section>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-300">Description</h2>
                <div className="rounded-xl border border-dark-tertiary bg-dark px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-100">{problem.description}</p>
                </div>
              </section>

              <section>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-300">Examples</h2>
                <div className="space-y-3">
                  {problem.examples?.length ? (
                    problem.examples.map((example: any, idx: number) => (
                      <article key={idx} className="rounded-xl border border-dark-tertiary bg-dark p-4">
                        <p className="mb-2 font-mono text-xs text-gray-100 sm:text-sm">
                          <span className="font-semibold text-emerald-300">Input:</span> {example.input}
                        </p>
                        <p className="font-mono text-xs text-gray-100 sm:text-sm">
                          <span className="font-semibold text-sky-300">Output:</span> {example.output}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dark-tertiary bg-dark px-4 py-3 text-sm text-slate-300">
                      No examples available for this problem.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-300">Constraints</h2>
                <div className="rounded-xl border border-dark-tertiary bg-dark px-4 py-3">
                  {problem.constraints?.length ? (
                    <ul className="space-y-2 text-sm text-gray-100">
                      {problem.constraints.map((constraint: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
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

          {/* Editor Panel */}
          <section className="flex min-h-0 flex-col rounded-2xl border border-dark-tertiary bg-dark-secondary text-gray-100 shadow-card">
            <header className="flex flex-wrap items-center gap-3 border-b border-dark-tertiary px-4 py-3">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="min-w-[150px] rounded-lg border border-dark-tertiary bg-dark px-3 py-2 text-sm text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isRunning ? 'Submitting...' : 'Submit'}
              </button>
            </header>

            <div className="min-h-0 flex-1 border-b border-dark-tertiary">
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
                }}
              />
            </div>

            <div className="grid items-stretch gap-3 p-4 md:grid-cols-2">
              <div className="rounded-xl border border-dark-tertiary bg-dark p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300">Input</h3>
                  <span className="text-[11px] text-slate-400">stdin</span>
                </div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={'Enter custom input for your program. Example:\n3\n1 2 3'}
                  className="h-36 w-full resize-none rounded-lg border border-dark-tertiary bg-dark-secondary px-3 py-2 text-sm text-gray-100 placeholder:text-slate-400"
                />
                <p className="mt-2 text-[11px] text-slate-400">Used when you click Run Code. Leave empty if no input is required.</p>
              </div>

              <div className="rounded-xl border border-dark-tertiary bg-dark p-3">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-300">Output</h3>
                <pre className="h-36 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-dark-tertiary bg-dark-secondary p-2 text-xs font-mono text-gray-100 sm:text-sm">{output || 'Run your code to see output and test feedback here.'}</pre>

                {testResults && (
                  <div className="mt-3 border-t border-dark-tertiary pt-3">
                    <p className="text-sm text-gray-100">
                      Tests Passed:{' '}
                      <span className={testResults.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>
                        {testResults.testsPassed}/{testResults.totalTests}
                      </span>
                    </p>
                    {testResults.aiFeedback && (
                      <div className="mt-2 space-y-1 text-xs text-slate-200 sm:text-sm">
                        <p>{testResults.aiFeedback.complexity}</p>
                        {(testResults.aiFeedback.suggestions || []).length > 0 && (
                          <p className="whitespace-pre-wrap">- {(testResults.aiFeedback.suggestions || []).join('\n- ')}</p>
                        )}
                      </div>
                    )}
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
