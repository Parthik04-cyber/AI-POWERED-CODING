'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Layout from '@/layouts/MainLayout';
import { problemAPI, submissionAPI } from '@/services/api';
import { useEditorStore, useAuthStore } from '@/utils/store';

const EditorPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { code, language, output, isRunning, setCode, setLanguage, setOutput, setIsRunning } = useEditorStore();

  const [problem, setProblem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProblem();
  }, [user, router]);

  const loadProblem = async () => {
    try {
      const { data } = await problemAPI.getProblemById(params.id as string);
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
      const { data } = await submissionAPI.submitCode({
        problemId: params.id as string,
        code,
        language,
      });
      setTestResults(data);
      setOutput(`Submission ID: ${data._id}\nStatus: ${data.status}`);
    } catch (error: any) {
      setOutput(`Error: ${error.response?.data?.error || 'Submission failed'}`);
    } finally {
      setIsRunning(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="bg-dark-secondary border border-dark-tertiary rounded-lg p-6 overflow-y-auto max-h-screen">
            <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 rounded bg-blue-900 text-blue-200">{problem.difficulty}</span>
              <span className="px-3 py-1 rounded bg-gray-900 text-gray-300">{problem.category}</span>
            </div>

            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-300 mb-6">{problem.description}</p>

            <h2 className="text-xl font-bold mb-4">Examples</h2>
            <div className="space-y-4 mb-6">
              {problem.examples?.map((example: any, idx: number) => (
                <div key={idx} className="bg-dark p-4 rounded border border-dark-tertiary">
                  <p className="font-mono text-sm mb-2">
                    <span className="text-green-400">Input:</span> {example.input}
                  </p>
                  <p className="font-mono text-sm">
                    <span className="text-blue-400">Output:</span> {example.output}
                  </p>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-4">Constraints</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              {problem.constraints?.map((constraint: string, idx: number) => (
                <li key={idx}>{constraint}</li>
              ))}
            </ul>
          </div>

          {/* Code Editor */}
          <div className="flex flex-col h-screen">
            <div className="flex gap-4 mb-4">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="px-4 py-2 border border-dark-tertiary rounded-lg bg-dark-secondary text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={handleSubmit}
                disabled={isRunning}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isRunning ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <div className="flex-1 border border-dark-tertiary rounded-lg overflow-hidden mb-4">
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

            <div className="bg-dark-secondary border border-dark-tertiary rounded-lg p-4 max-h-40 overflow-y-auto">
              <h3 className="font-bold mb-2">Output</h3>
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">{output || 'Run your code to see output...'}</pre>
              {testResults && (
                <div className="mt-4 pt-4 border-t border-dark-tertiary">
                  <p className="text-sm">
                    Tests Passed: <span className={testResults.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>{testResults.testsPassed}/{testResults.totalTests}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditorPage;
