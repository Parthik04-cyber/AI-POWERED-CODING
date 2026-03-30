import axios from 'axios';
import OpenAI from 'openai';
import { ISubmission } from '../models/Submission';
import { query } from '../config/database';
import { generateId, getUserById, mapLeaderboardRow, mapSubmissionRow } from '../utils/persistence';
import { compareOutputs, normalizeOutput, getOutputDifference } from '../utils/outputNormalization';
import problemService from './problemService';
import storeService from './storeService';

interface Judge0Response {
  status: { id: number; description: string };
  compile_output?: string;
  runtime_error?: string;
  time?: number;
  memory?: number;
  stdout?: string;
}

interface AnalyticsOverview {
  totalSubmissions: number;
  acceptanceRate: number;
  activeUsers: number;
  averageUserScore: number;
}

interface DifficultyPerformance {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalSubmissions: number;
  totalAccepted: number;
  acceptanceRate: number;
}

interface LanguageDistribution {
  language: string;
  count: number;
}

interface DifficultyMix {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
}

export interface AdminAnalyticsResponse {
  overview: AnalyticsOverview;
  problemCategoryPerformance: DifficultyPerformance[];
  submissionLanguagesDistribution: LanguageDistribution[];
  difficultyMix: DifficultyMix[];
}

class SubmissionService {
  private judge0BaseUrl = process.env.JUDGE0_API_BASE_URL || 'http://localhost:2358';
  private judge0ApiKey = process.env.JUDGE0_API_KEY || '';
  private judge0ApiHost = process.env.JUDGE0_API_HOST || '';
  private openaiClient = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  private isRapidApiProvider(): boolean {
    return /rapidapi\.com/i.test(this.judge0BaseUrl);
  }

  private getResolvedJudge0Host(): string {
    if (this.judge0ApiHost.trim()) {
      return this.judge0ApiHost.trim();
    }

    try {
      return new URL(this.judge0BaseUrl).host;
    } catch {
      return 'ce.judge0.com';
    }
  }

  private getJudge0Headers() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.isRapidApiProvider()) {
      if (!this.judge0ApiKey.trim()) {
        throw new Error('JUDGE0_API_KEY is missing. Configure a valid RapidAPI Judge0 key in backend/.env');
      }

      headers['X-RapidAPI-Key'] = this.judge0ApiKey.trim();
      headers['X-RapidAPI-Host'] = this.getResolvedJudge0Host();
      return headers;
    }

    // Non-RapidAPI Judge0 deployments usually do not require these headers.
    // If a key is provided, keep it available via common auth headers.
    if (this.judge0ApiKey.trim()) {
      headers['Authorization'] = `Bearer ${this.judge0ApiKey.trim()}`;
      headers['X-Auth-Token'] = this.judge0ApiKey.trim();
    }

    return headers;
  }

  private async postToJudge0(payload: { source_code: string; language_id: number; stdin?: string; expected_output?: string }) {
    try {
      const response = await axios.post(
        `${this.judge0BaseUrl}/submissions?wait=true`,
        payload,
        {
          headers: this.getJudge0Headers(),
          timeout: 20000,
        }
      );

      return response.data as Judge0Response;
    } catch (error: any) {
      const status = error?.response?.status;
      const provider = this.isRapidApiProvider() ? 'RapidAPI Judge0' : 'Judge0';

      if (status === 401 || status === 403) {
        throw new Error(
          `${provider} authorization failed (${status}). Verify JUDGE0_API_KEY and JUDGE0_API_HOST in backend/.env`
        );
      }

      const upstreamMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      throw new Error(`Judge0 request failed${status ? ` (${status})` : ''}: ${upstreamMessage || 'Unknown error'}`);
    }
  }

  private getSubmissionSelect(includeUser: boolean, includeProblem: boolean): string {
    const joins: string[] = [];
    const selected: string[] = ['s.*'];

    if (includeUser) {
      joins.push('LEFT JOIN users u ON s.user_id = u.id');
      selected.push('u.id AS user_ref_id', 'u.username AS user_ref_username', 'u.email AS user_ref_email');
    }

    if (includeProblem) {
      joins.push('LEFT JOIN problems p ON s.problem_id = p.id');
      selected.push('p.id AS problem_ref_id', 'p.title AS problem_ref_title', 'p.difficulty AS problem_ref_difficulty');
    }

    return `SELECT ${selected.join(', ')} FROM submissions s ${joins.join(' ')}`;
  }

  async executeCode(code: string, language: string, stdin: string = ''): Promise<Judge0Response> {
    const languageMap: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
    };

    const languageId = languageMap[language] || 71;

    return this.postToJudge0({
      source_code: code,
      language_id: languageId,
      stdin,
    });
  }

  async runCodeWithTestCases(
    code: string,
    language: string,
    testCases: Array<{ input: string; output: string }>
  ): Promise<{ testResults: any[]; status: string; testsPassed: number; totalTests: number }> {
    const languageMap: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
    };

    const languageId = languageMap[language] || 71;
    let testsPassed = 0;
    let status = 'SUCCESS';
    const testCaseResults: any[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const testResult: any = {
        input: testCase.input,
        expected: testCase.output,
        actual: '',
        passed: false,
      };

      try {
        const result = await this.postToJudge0({
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.output,
        });

        testResult.actual = result.stdout || '';
        if (result.time) testResult.executionTime = result.time;
        if (result.memory) testResult.memory = result.memory;

        if (result.status.id === 3) {
          // Accepted - verify with normalization
          const isMatch = compareOutputs(testResult.actual, testCase.output);
          testResult.passed = isMatch;
          if (isMatch) {
            testsPassed++;
          } else {
            testResult.error = getOutputDifference(testResult.actual, testCase.output);
            if (status === 'SUCCESS') {
              status = 'WRONG_ANSWER';
            }
          }
        } else if (result.status.id === 4) {
          // Wrong Answer
          testResult.passed = false;
          testResult.error = getOutputDifference(testResult.actual, testCase.output);
          if (status === 'SUCCESS') {
            status = 'WRONG_ANSWER';
          }
        } else if (result.status.id === 5) {
          // Time Limit Exceeded
          testResult.passed = false;
          testResult.error = 'Time limit exceeded';
          if (status === 'SUCCESS') {
            status = 'TIME_LIMIT_EXCEEDED';
          }
        } else if (result.status.id === 6) {
          // Compilation Error
          testResult.passed = false;
          testResult.error = result.compile_output || 'Compilation error';
          status = 'COMPILE_ERROR';
          testCaseResults.push(testResult);
          break;
        } else if (result.status.id === 7) {
          // Runtime Error
          testResult.passed = false;
          testResult.error = result.runtime_error || 'Runtime error';
          if (status === 'SUCCESS') {
            status = 'RUNTIME_ERROR';
          }
        }
      } catch (err: any) {
        testResult.passed = false;
        testResult.error = err?.message || 'Failed to execute test case';
        status = 'RUNTIME_ERROR';
      }

      testCaseResults.push(testResult);
    }

    return {
      testResults: testCaseResults,
      status,
      testsPassed,
      totalTests: testCases.length,
    };
  }

  async submitCode(
    userId: string,
    problemId: string,
    code: string,
    language: string
  ): Promise<ISubmission> {
    const problemResult = await query<any>('SELECT id, test_cases FROM problems WHERE id = $1', [problemId]);
    const problem = problemResult.rows[0];
    if (!problem) {
      throw new Error('Problem not found');
    }

    const submissionId = generateId();
    const submissionResult = await query<any>(
      `
        INSERT INTO submissions (
          id, user_id, problem_id, code, language, status,
          execution_time, memory, output, tests_passed, total_tests, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'PENDING', 0, 0, '', 0, 0, NOW(), NOW())
        RETURNING *
      `,
      [submissionId, userId, problemId, code, language]
    );

    const submission = mapSubmissionRow(submissionResult.rows[0]);

    this.executeCodeAsync(submissionId, code, language, Array.isArray(problem.test_cases) ? problem.test_cases : []);

    return submission;
  }

  async executeCodeAsync(
    submissionId: string,
    code: string,
    language: string,
    testCases: any[]
  ): Promise<void> {
    try {
      const languageMap: Record<string, number> = {
        javascript: 63,
        python: 71,
        java: 62,
        cpp: 54,
      };

      const languageId = languageMap[language] || 71;
      let testsPassed = 0;
      let executionTime = 0;
      let memory = 0;
      let status = 'SUCCESS';
      let output = '';
      let error = '';
      const testCaseResults: any[] = [];

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const testResult: any = {
          input: testCase.input,
          expected: testCase.output,
          actual: '',
          passed: false,
        };

        try {
          const result = await this.postToJudge0({
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output,
          });

          testResult.actual = result.stdout || '';
          if (result.time) testResult.executionTime = result.time;
          if (result.memory) testResult.memory = result.memory;

          if (result.status.id === 3) {
            // Accepted - also verify with our normalization
            const isMatch = compareOutputs(testResult.actual, testCase.output);
            testResult.passed = isMatch;
            if (isMatch) {
              testsPassed++;
              output = result.stdout || '';
            } else {
              // Output mismatch after normalization
              testResult.passed = false;
              testResult.error = getOutputDifference(testResult.actual, testCase.output);
              if (status === 'SUCCESS') {
                status = 'WRONG_ANSWER';
              }
            }
          } else if (result.status.id === 4) {
            // Wrong Answer
            testResult.passed = false;
            const difference = getOutputDifference(testResult.actual, testCase.output);
            testResult.error = difference || `Expected: "${normalizeOutput(testCase.output)}", Got: "${normalizeOutput(result.stdout || '')}"`;
            if (status === 'SUCCESS') {
              status = 'WRONG_ANSWER';
            }
          } else if (result.status.id === 5) {
            // Time Limit Exceeded
            testResult.passed = false;
            testResult.error = 'Time limit exceeded';
            if (status === 'SUCCESS') {
              status = 'TIME_LIMIT_EXCEEDED';
            }
          } else if (result.status.id === 6) {
            // Compilation Error
            testResult.passed = false;
            testResult.error = result.compile_output || 'Compilation error';
            status = 'COMPILE_ERROR';
            error = result.compile_output || 'Compilation error';
            testCaseResults.push(testResult);
            break;
          } else if (result.status.id === 7) {
            // Runtime Error
            testResult.passed = false;
            testResult.error = result.runtime_error || 'Runtime error';
            if (status === 'SUCCESS') {
              status = 'RUNTIME_ERROR';
            }
          }

          if (result.time) executionTime += result.time;
          if (result.memory) memory = Math.max(memory, result.memory);
        } catch (err: any) {
          testResult.passed = false;
          testResult.error = err?.message || 'Failed to execute test case';
          status = 'RUNTIME_ERROR';
          error = err?.message || 'Failed to execute test case';
        }

        testCaseResults.push(testResult);
      }

      const updateResult = await query<any>(
        `
          UPDATE submissions
          SET
            status = $2,
            tests_passed = $3,
            total_tests = $4,
            execution_time = $5,
            memory = $6,
            output = $7,
            error = $8,
            test_case_results = $9,
            updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [submissionId, status, testsPassed, testCases.length, executionTime, memory, output, error || null, JSON.stringify(testCaseResults)]
      );

      const submission = updateResult.rows[0] ? mapSubmissionRow(updateResult.rows[0]) : null;

      if (!submission) return;

      if (typeof submission.problemId === 'string') {
        await problemService.incrementSubmissionCount(submission.problemId, status === 'SUCCESS');
      }

      if (typeof submission.userId === 'string' && typeof submission.problemId === 'string' && status === 'SUCCESS') {
        await storeService.rewardProblemSolve(submission.userId, submission.problemId);
        await this.syncLeaderboardEntry(submission.userId);
      } else if (typeof submission.userId === 'string') {
        await storeService.recordFailedSubmission(submission.userId);
        await this.syncLeaderboardEntry(submission.userId);
      }

      await this.generateAndAttachAIFeedback(submissionId, code, language);
    } catch (error) {
      console.error('Error executing code:', error);
      await query(
        `
          UPDATE submissions
          SET status = 'RUNTIME_ERROR', error = 'Failed to execute code', updated_at = NOW()
          WHERE id = $1
        `,
        [submissionId]
      );
    }
  }

  async getSubmissionById(submissionId: string) {
    const result = await query<any>(
      `${this.getSubmissionSelect(true, true)} WHERE s.id = $1`,
      [submissionId]
    );

    if (result.rowCount === 0) {
      throw new Error('Submission not found');
    }

    return mapSubmissionRow(result.rows[0]);
  }

  async getUserSubmissions(userId: string, skip: number = 0, limit: number = 10) {
    const submissionsResult = await query<any>(
      `
        ${this.getSubmissionSelect(false, true)}
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
        OFFSET $2
        LIMIT $3
      `,
      [userId, skip, limit]
    );
    const totalResult = await query<{ total: string }>('SELECT COUNT(*)::text AS total FROM submissions WHERE user_id = $1', [userId]);

    const submissions = submissionsResult.rows.map((row) => mapSubmissionRow(row));
    const total = Number(totalResult.rows[0]?.total || 0);
    return { submissions, total };
  }

  async getProblemSubmissions(problemId: string, skip: number = 0, limit: number = 10) {
    const submissionsResult = await query<any>(
      `
        SELECT s.*, u.id AS user_ref_id, u.username AS user_ref_username
        FROM submissions s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.problem_id = $1
        ORDER BY s.created_at DESC
        OFFSET $2
        LIMIT $3
      `,
      [problemId, skip, limit]
    );
    const totalResult = await query<{ total: string }>('SELECT COUNT(*)::text AS total FROM submissions WHERE problem_id = $1', [problemId]);

    const submissions = submissionsResult.rows.map((row) => mapSubmissionRow(row));
    const total = Number(totalResult.rows[0]?.total || 0);
    return { submissions, total };
  }

  async getLeaderboard(limit: number = 10) {
    const result = await query<any>(
      `
        SELECT * FROM leaderboard
        ORDER BY score DESC, problems_solved DESC, updated_at ASC
        LIMIT $1
      `,
      [limit]
    );

    return result.rows.map((row) => mapLeaderboardRow(row));
  }

  async getAllSubmissions(skip: number = 0, limit: number = 20) {
    const submissionsResult = await query<any>(
      `
        ${this.getSubmissionSelect(true, true)}
        ORDER BY s.created_at DESC
        OFFSET $1
        LIMIT $2
      `,
      [skip, limit]
    );
    const totalResult = await query<{ total: string }>('SELECT COUNT(*)::text AS total FROM submissions');

    const submissions = submissionsResult.rows.map((row) => mapSubmissionRow(row));
    const total = Number(totalResult.rows[0]?.total || 0);
    return { submissions, total };
  }

  async getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
    const [
      overviewResult,
      difficultyPerformanceResult,
      languageDistributionResult,
      difficultyMixResult,
    ] = await Promise.all([
      query<{
        total_submissions: string;
        accepted_submissions: string;
        active_users: string;
        average_user_score: string;
      }>(
        `
          SELECT
            (SELECT COUNT(*)::text FROM submissions) AS total_submissions,
            (SELECT COUNT(*)::text FROM submissions WHERE status = 'SUCCESS') AS accepted_submissions,
            (SELECT COUNT(DISTINCT user_id)::text FROM submissions WHERE created_at >= NOW() - INTERVAL '30 days') AS active_users,
            (SELECT COALESCE(AVG(score), 0)::text FROM users) AS average_user_score
        `
      ),
      query<{
        difficulty: 'Easy' | 'Medium' | 'Hard';
        total_submissions: string;
        total_accepted: string;
      }>(
        `
          WITH difficulty_levels AS (
            SELECT unnest(ARRAY['Easy', 'Medium', 'Hard'])::text AS difficulty
          )
          SELECT
            d.difficulty,
            COALESCE(COUNT(s.id), 0)::text AS total_submissions,
            COALESCE(COUNT(*) FILTER (WHERE s.status = 'SUCCESS'), 0)::text AS total_accepted
          FROM difficulty_levels d
          LEFT JOIN problems p ON p.difficulty = d.difficulty
          LEFT JOIN submissions s ON s.problem_id = p.id
          GROUP BY d.difficulty
          ORDER BY CASE d.difficulty
            WHEN 'Easy' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'Hard' THEN 3
            ELSE 4
          END
        `
      ),
      query<{ language: string; count: string }>(
        `
          SELECT
            COALESCE(NULLIF(TRIM(language), ''), 'unknown') AS language,
            COUNT(*)::text AS count
          FROM submissions
          GROUP BY language
          ORDER BY COUNT(*) DESC, language ASC
        `
      ),
      query<{ difficulty: 'Easy' | 'Medium' | 'Hard'; count: string }>(
        `
          WITH difficulty_levels AS (
            SELECT unnest(ARRAY['Easy', 'Medium', 'Hard'])::text AS difficulty
          )
          SELECT
            d.difficulty,
            COALESCE(COUNT(p.id), 0)::text AS count
          FROM difficulty_levels d
          LEFT JOIN problems p ON p.difficulty = d.difficulty
          GROUP BY d.difficulty
          ORDER BY CASE d.difficulty
            WHEN 'Easy' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'Hard' THEN 3
            ELSE 4
          END
        `
      ),
    ]);

    const overviewRow = overviewResult.rows[0] || {
      total_submissions: '0',
      accepted_submissions: '0',
      active_users: '0',
      average_user_score: '0',
    };

    const totalSubmissions = Number(overviewRow.total_submissions || 0);
    const acceptedSubmissions = Number(overviewRow.accepted_submissions || 0);
    const acceptanceRate = totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0;

    return {
      overview: {
        totalSubmissions,
        acceptanceRate,
        activeUsers: Number(overviewRow.active_users || 0),
        averageUserScore: Number(Number(overviewRow.average_user_score || 0).toFixed(1)),
      },
      problemCategoryPerformance: difficultyPerformanceResult.rows.map((row) => {
        const submissions = Number(row.total_submissions || 0);
        const accepted = Number(row.total_accepted || 0);

        return {
          difficulty: row.difficulty,
          totalSubmissions: submissions,
          totalAccepted: accepted,
          acceptanceRate: submissions > 0 ? Number(((accepted / submissions) * 100).toFixed(1)) : 0,
        };
      }),
      submissionLanguagesDistribution: languageDistributionResult.rows.map((row) => ({
        language: row.language,
        count: Number(row.count || 0),
      })),
      difficultyMix: difficultyMixResult.rows.map((row) => ({
        difficulty: row.difficulty,
        count: Number(row.count || 0),
      })),
    };
  }

  private async syncLeaderboardEntry(userId: string): Promise<void> {
    const user = await getUserById(userId, { includeRelations: false });
    if (!user) {
      return;
    }

    await query(
      `
        INSERT INTO leaderboard (id, user_id, username, score, problems_solved, total_submissions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          username = EXCLUDED.username,
          score = EXCLUDED.score,
          problems_solved = EXCLUDED.problems_solved,
          total_submissions = EXCLUDED.total_submissions,
          updated_at = NOW()
      `,
      [generateId(), user._id, user.username, user.score || 0, user.problemsSolved || 0, user.totalSubmissions || 0]
    );
  }

  private async generateAndAttachAIFeedback(
    submissionId: string,
    code: string,
    language: string
  ): Promise<void> {
    if (!this.openaiClient) {
      return;
    }

    try {
      const response = await this.openaiClient.responses.create({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content:
              'You analyze coding submissions. Return strict JSON with keys: timeComplexity, spaceComplexity, optimizationSuggestions (string array). Keep feedback concise and practical.',
          },
          {
            role: 'user',
            content: `Language: ${language}\n\nCode:\n${code}`,
          },
        ],
      });

      const raw = response.output_text;
      if (!raw) {
        return;
      }

      const parsed = this.parseJsonSafely(raw);
      if (!parsed) {
        return;
      }
      const suggestions = Array.isArray(parsed.optimizationSuggestions)
        ? parsed.optimizationSuggestions
        : [];

      await query(
        `
          UPDATE submissions
          SET ai_feedback = $2, updated_at = NOW()
          WHERE id = $1
        `,
        [
          submissionId,
          {
            timeComplexity: parsed.timeComplexity || 'N/A',
            spaceComplexity: parsed.spaceComplexity || 'N/A',
            optimizationSuggestions: suggestions,
            complexity: `Time: ${parsed.timeComplexity || 'N/A'}, Space: ${parsed.spaceComplexity || 'N/A'}`,
            suggestions,
            optimization: suggestions[0] || 'No optimization suggestions provided.',
            score: 0,
          },
        ]
      );
    } catch (error) {
      console.error('AI feedback generation failed:', error);
    }
  }

  private parseJsonSafely(raw: string): any | null {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (_nestedError) {
        return null;
      }
    }
  }
}

export default new SubmissionService();
