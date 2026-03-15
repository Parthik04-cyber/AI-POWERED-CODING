"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const openai_1 = __importDefault(require("openai"));
const database_1 = require("../config/database");
const persistence_1 = require("../utils/persistence");
const problemService_1 = __importDefault(require("./problemService"));
const storeService_1 = __importDefault(require("./storeService"));
class SubmissionService {
    constructor() {
        this.judge0BaseUrl = process.env.JUDGE0_API_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
        this.judge0ApiKey = process.env.JUDGE0_API_KEY || '';
        this.openaiClient = process.env.OPENAI_API_KEY
            ? new openai_1.default({ apiKey: process.env.OPENAI_API_KEY })
            : null;
    }
    getJudge0Headers() {
        return {
            'X-RapidAPI-Key': this.judge0ApiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json',
        };
    }
    getSubmissionSelect(includeUser, includeProblem) {
        const joins = [];
        const selected = ['s.*'];
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
    async executeCode(code, language, stdin = '') {
        const languageMap = {
            javascript: 63,
            python: 71,
            java: 62,
            cpp: 54,
        };
        const languageId = languageMap[language] || 71;
        const response = await axios_1.default.post(`${this.judge0BaseUrl}/submissions?wait=true`, {
            source_code: code,
            language_id: languageId,
            stdin,
        }, {
            headers: this.getJudge0Headers(),
        });
        return response.data;
    }
    async submitCode(userId, problemId, code, language) {
        const problemResult = await (0, database_1.query)('SELECT id, test_cases FROM problems WHERE id = $1', [problemId]);
        const problem = problemResult.rows[0];
        if (!problem) {
            throw new Error('Problem not found');
        }
        const submissionId = (0, persistence_1.generateId)();
        const submissionResult = await (0, database_1.query)(`
        INSERT INTO submissions (
          id, user_id, problem_id, code, language, status,
          execution_time, memory, output, tests_passed, total_tests, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'PENDING', 0, 0, '', 0, 0, NOW(), NOW())
        RETURNING *
      `, [submissionId, userId, problemId, code, language]);
        const submission = (0, persistence_1.mapSubmissionRow)(submissionResult.rows[0]);
        this.executeCodeAsync(submissionId, code, language, Array.isArray(problem.test_cases) ? problem.test_cases : []);
        return submission;
    }
    async executeCodeAsync(submissionId, code, language, testCases) {
        try {
            const languageMap = {
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
                    const response = await axios_1.default.post(`${this.judge0BaseUrl}/submissions?wait=true`, {
                        source_code: code,
                        language_id: languageId,
                        stdin: testCase.input,
                        expected_output: testCase.output,
                    }, {
                        headers: this.getJudge0Headers(),
                    });
                    const result = response.data;
                    if (result.status.id === 3) {
                        // Accepted
                        testsPassed++;
                        output = result.stdout || '';
                    }
                    else if (result.status.id === 4) {
                        status = 'WRONG_ANSWER';
                        error = `Expected: ${testCase.output}, Got: ${result.stdout}`;
                    }
                    else if (result.status.id === 5) {
                        status = 'TIME_LIMIT_EXCEEDED';
                        error = result.runtime_error || 'Time limit exceeded';
                    }
                    else if (result.status.id === 6) {
                        status = 'COMPILE_ERROR';
                        error = result.compile_output || 'Compilation error';
                        break;
                    }
                    else if (result.status.id === 7) {
                        status = 'RUNTIME_ERROR';
                        error = result.runtime_error || 'Runtime error';
                    }
                    if (result.time)
                        executionTime += result.time;
                    if (result.memory)
                        memory = Math.max(memory, result.memory);
                }
                catch (err) {
                    status = 'RUNTIME_ERROR';
                    error = 'Failed to execute test case';
                    break;
                }
            }
            const updateResult = await (0, database_1.query)(`
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
        `, [submissionId, status, testsPassed, testCases.length, executionTime, memory, output, error || null]);
            const submission = updateResult.rows[0] ? (0, persistence_1.mapSubmissionRow)(updateResult.rows[0]) : null;
            if (!submission)
                return;
            if (typeof submission.problemId === 'string') {
                await problemService_1.default.incrementSubmissionCount(submission.problemId, status === 'SUCCESS');
            }
            if (typeof submission.userId === 'string' && typeof submission.problemId === 'string' && status === 'SUCCESS') {
                await storeService_1.default.rewardProblemSolve(submission.userId, submission.problemId);
                await this.syncLeaderboardEntry(submission.userId);
            }
            else if (typeof submission.userId === 'string') {
                await storeService_1.default.recordFailedSubmission(submission.userId);
                await this.syncLeaderboardEntry(submission.userId);
            }
            await this.generateAndAttachAIFeedback(submissionId, code, language);
        }
        catch (error) {
            console.error('Error executing code:', error);
            await (0, database_1.query)(`
          UPDATE submissions
          SET status = 'RUNTIME_ERROR', error = 'Failed to execute code', updated_at = NOW()
          WHERE id = $1
        `, [submissionId]);
        }
    }
    async getSubmissionById(submissionId) {
        const result = await (0, database_1.query)(`${this.getSubmissionSelect(true, true)} WHERE s.id = $1`, [submissionId]);
        if (result.rowCount === 0) {
            throw new Error('Submission not found');
        }
        return (0, persistence_1.mapSubmissionRow)(result.rows[0]);
    }
    async getUserSubmissions(userId, skip = 0, limit = 10) {
        const submissionsResult = await (0, database_1.query)(`
        ${this.getSubmissionSelect(false, true)}
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC
        OFFSET $2
        LIMIT $3
      `, [userId, skip, limit]);
        const totalResult = await (0, database_1.query)('SELECT COUNT(*)::text AS total FROM submissions WHERE user_id = $1', [userId]);
        const submissions = submissionsResult.rows.map((row) => (0, persistence_1.mapSubmissionRow)(row));
        const total = Number(totalResult.rows[0]?.total || 0);
        return { submissions, total };
    }
    async getProblemSubmissions(problemId, skip = 0, limit = 10) {
        const submissionsResult = await (0, database_1.query)(`
        SELECT s.*, u.id AS user_ref_id, u.username AS user_ref_username
        FROM submissions s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.problem_id = $1
        ORDER BY s.created_at DESC
        OFFSET $2
        LIMIT $3
      `, [problemId, skip, limit]);
        const totalResult = await (0, database_1.query)('SELECT COUNT(*)::text AS total FROM submissions WHERE problem_id = $1', [problemId]);
        const submissions = submissionsResult.rows.map((row) => (0, persistence_1.mapSubmissionRow)(row));
        const total = Number(totalResult.rows[0]?.total || 0);
        return { submissions, total };
    }
    async getLeaderboard(limit = 10) {
        const result = await (0, database_1.query)(`
        SELECT * FROM leaderboard
        ORDER BY score DESC, problems_solved DESC, updated_at ASC
        LIMIT $1
      `, [limit]);
        return result.rows.map((row) => (0, persistence_1.mapLeaderboardRow)(row));
    }
    async getAllSubmissions(skip = 0, limit = 20) {
        const submissionsResult = await (0, database_1.query)(`
        ${this.getSubmissionSelect(true, true)}
        ORDER BY s.created_at DESC
        OFFSET $1
        LIMIT $2
      `, [skip, limit]);
        const totalResult = await (0, database_1.query)('SELECT COUNT(*)::text AS total FROM submissions');
        const submissions = submissionsResult.rows.map((row) => (0, persistence_1.mapSubmissionRow)(row));
        const total = Number(totalResult.rows[0]?.total || 0);
        return { submissions, total };
    }
    async getAdminAnalytics() {
        const [overviewResult, difficultyPerformanceResult, languageDistributionResult, difficultyMixResult,] = await Promise.all([
            (0, database_1.query)(`
          SELECT
            (SELECT COUNT(*)::text FROM submissions) AS total_submissions,
            (SELECT COUNT(*)::text FROM submissions WHERE status = 'SUCCESS') AS accepted_submissions,
            (SELECT COUNT(DISTINCT user_id)::text FROM submissions WHERE created_at >= NOW() - INTERVAL '30 days') AS active_users,
            (SELECT COALESCE(AVG(score), 0)::text FROM users) AS average_user_score
        `),
            (0, database_1.query)(`
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
        `),
            (0, database_1.query)(`
          SELECT
            COALESCE(NULLIF(TRIM(language), ''), 'unknown') AS language,
            COUNT(*)::text AS count
          FROM submissions
          GROUP BY language
          ORDER BY COUNT(*) DESC, language ASC
        `),
            (0, database_1.query)(`
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
        `),
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
    async syncLeaderboardEntry(userId) {
        const user = await (0, persistence_1.getUserById)(userId, { includeRelations: false });
        if (!user) {
            return;
        }
        await (0, database_1.query)(`
        INSERT INTO leaderboard (id, user_id, username, score, problems_solved, total_submissions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          username = EXCLUDED.username,
          score = EXCLUDED.score,
          problems_solved = EXCLUDED.problems_solved,
          total_submissions = EXCLUDED.total_submissions,
          updated_at = NOW()
      `, [(0, persistence_1.generateId)(), user._id, user.username, user.score || 0, user.problemsSolved || 0, user.totalSubmissions || 0]);
    }
    async generateAndAttachAIFeedback(submissionId, code, language) {
        if (!this.openaiClient) {
            return;
        }
        try {
            const response = await this.openaiClient.responses.create({
                model: 'gpt-4.1-mini',
                input: [
                    {
                        role: 'system',
                        content: 'You analyze coding submissions. Return strict JSON with keys: timeComplexity, spaceComplexity, optimizationSuggestions (string array). Keep feedback concise and practical.',
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
            await (0, database_1.query)(`
          UPDATE submissions
          SET ai_feedback = $2, updated_at = NOW()
          WHERE id = $1
        `, [
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
            ]);
        }
        catch (error) {
            console.error('AI feedback generation failed:', error);
        }
    }
    parseJsonSafely(raw) {
        try {
            return JSON.parse(raw);
        }
        catch (_error) {
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return null;
            }
            try {
                return JSON.parse(jsonMatch[0]);
            }
            catch (_nestedError) {
                return null;
            }
        }
    }
}
exports.default = new SubmissionService();
//# sourceMappingURL=submissionService.js.map