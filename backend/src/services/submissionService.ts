import axios from 'axios';
import OpenAI from 'openai';
import { ISubmission } from '../models/Submission';
import { query } from '../config/database';
import { generateId, getUserById, mapLeaderboardRow, mapSubmissionRow } from '../utils/persistence';
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

class SubmissionService {
  private judge0BaseUrl = process.env.JUDGE0_API_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
  private judge0ApiKey = process.env.JUDGE0_API_KEY || '';
  private openaiClient = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  private getJudge0Headers() {
    return {
      'X-RapidAPI-Key': this.judge0ApiKey,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    };
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

    const response = await axios.post(
      `${this.judge0BaseUrl}/submissions?wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin,
      },
      {
        headers: this.getJudge0Headers(),
      }
    );

    return response.data as Judge0Response;
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

      for (const testCase of testCases) {
        try {
          const response = await axios.post(
            `${this.judge0BaseUrl}/submissions?wait=true`,
            {
              source_code: code,
              language_id: languageId,
              stdin: testCase.input,
              expected_output: testCase.output,
            },
            {
              headers: this.getJudge0Headers(),
            }
          );

          const result: Judge0Response = response.data;

          if (result.status.id === 3) {
            // Accepted
            testsPassed++;
            output = result.stdout || '';
          } else if (result.status.id === 4) {
            status = 'WRONG_ANSWER';
            error = `Expected: ${testCase.output}, Got: ${result.stdout}`;
          } else if (result.status.id === 5) {
            status = 'TIME_LIMIT_EXCEEDED';
            error = result.runtime_error || 'Time limit exceeded';
          } else if (result.status.id === 6) {
            status = 'COMPILE_ERROR';
            error = result.compile_output || 'Compilation error';
            break;
          } else if (result.status.id === 7) {
            status = 'RUNTIME_ERROR';
            error = result.runtime_error || 'Runtime error';
          }

          if (result.time) executionTime += result.time;
          if (result.memory) memory = Math.max(memory, result.memory);
        } catch (err) {
          status = 'RUNTIME_ERROR';
          error = 'Failed to execute test case';
          break;
        }
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
            updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [submissionId, status, testsPassed, testCases.length, executionTime, memory, output, error || null]
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
