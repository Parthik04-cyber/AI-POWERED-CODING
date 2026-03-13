export type SubmissionUserRef = string | { _id: string; username: string; email?: string };
export type SubmissionProblemRef = string | { _id: string; title: string; difficulty?: 'Easy' | 'Medium' | 'Hard' };

export interface ISubmission {
  _id: string;
  userId: SubmissionUserRef;
  problemId: SubmissionProblemRef;
  code: string;
  language: string;
  status: 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'WRONG_ANSWER' | 'PENDING';
  executionTime: number;
  memory: number;
  output: string;
  error?: string;
  testsPassed: number;
  totalTests: number;
  aiFeedback?: {
    timeComplexity?: string;
    spaceComplexity?: string;
    optimizationSuggestions?: string[];
    complexity: string;
    suggestions: string[];
    optimization: string;
    score: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
