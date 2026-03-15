"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const persistence_1 = require("../utils/persistence");
const parseJsonArrayInput = (value, fieldName) => {
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            throw new Error(`${fieldName} must be a JSON array`);
        }
        return parsed;
    }
    catch (_error) {
        throw new Error(`${fieldName} must be a valid JSON array`);
    }
};
const normalizeExamples = (value, fieldName) => {
    let rawItems;
    if (value === undefined || value === null) {
        return [];
    }
    if (typeof value === 'string') {
        rawItems = parseJsonArrayInput(value, fieldName);
    }
    else if (Array.isArray(value)) {
        rawItems = value;
    }
    else {
        throw new Error(`${fieldName} must be an array`);
    }
    return rawItems.map((item, index) => {
        const candidate = item;
        if (!candidate || typeof candidate !== 'object') {
            throw new Error(`${fieldName}[${index}] must be an object with input and output`);
        }
        if (candidate.input === undefined || candidate.output === undefined) {
            throw new Error(`${fieldName}[${index}] must include input and output`);
        }
        return {
            input: typeof candidate.input === 'string' ? candidate.input : JSON.stringify(candidate.input),
            output: typeof candidate.output === 'string' ? candidate.output : JSON.stringify(candidate.output),
        };
    });
};
class ProblemService {
    async getAllProblems(skip = 0, limit = 10, difficulty, category) {
        const conditions = [];
        const values = [];
        if (difficulty) {
            values.push(difficulty);
            conditions.push(`difficulty = $${values.length}`);
        }
        if (category) {
            values.push(category);
            conditions.push(`category = $${values.length}`);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const listValues = [...values, skip, limit];
        const problemsResult = await (0, database_1.query)(`
        SELECT * FROM problems
        ${whereClause}
        ORDER BY created_at DESC
        OFFSET $${values.length + 1}
        LIMIT $${values.length + 2}
      `, listValues);
        const totalResult = await (0, database_1.query)(`SELECT COUNT(*)::text AS total FROM problems ${whereClause}`, values);
        const problems = problemsResult.rows.map((row) => (0, persistence_1.mapProblemRow)(row));
        const total = Number(totalResult.rows[0]?.total || 0);
        return { problems, total, skip, limit };
    }
    async getProblemById(problemId) {
        const result = await (0, database_1.query)('SELECT * FROM problems WHERE id = $1', [problemId]);
        if (result.rowCount === 0) {
            throw new Error('Problem not found');
        }
        return (0, persistence_1.mapProblemRow)(result.rows[0]);
    }
    async createProblem(problemData) {
        const normalizedExamples = normalizeExamples(problemData.examples, 'examples');
        const normalizedTestCases = normalizeExamples(problemData.testCases, 'testCases');
        const result = await (0, database_1.query)(`
        INSERT INTO problems (
          id, title, description, difficulty, category, tags, examples, constraints,
          test_cases, time_limit, memory_limit, submission_count, accepted_count, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        RETURNING *
      `, [
            (0, persistence_1.generateId)(),
            problemData.title,
            problemData.description,
            problemData.difficulty,
            problemData.category,
            problemData.tags || [],
            JSON.stringify(normalizedExamples),
            problemData.constraints || [],
            JSON.stringify(normalizedTestCases),
            problemData.timeLimit ?? 5,
            problemData.memoryLimit ?? 256,
            problemData.submissionCount ?? 0,
            problemData.acceptedCount ?? 0,
        ]);
        return (0, persistence_1.mapProblemRow)(result.rows[0]);
    }
    async updateProblem(problemId, updateData) {
        const columnMap = {
            title: 'title',
            description: 'description',
            difficulty: 'difficulty',
            category: 'category',
            tags: 'tags',
            examples: 'examples',
            constraints: 'constraints',
            testCases: 'test_cases',
            timeLimit: 'time_limit',
            memoryLimit: 'memory_limit',
            submissionCount: 'submission_count',
            acceptedCount: 'accepted_count',
        };
        const entries = Object.entries(updateData).filter(([key, value]) => columnMap[key] && value !== undefined);
        if (entries.length === 0) {
            return this.getProblemById(problemId);
        }
        const values = entries.map(([key, value]) => {
            if (key === 'examples') {
                return JSON.stringify(normalizeExamples(value, 'examples'));
            }
            if (key === 'testCases') {
                return JSON.stringify(normalizeExamples(value, 'testCases'));
            }
            return value;
        });
        const setClause = entries.map(([key], index) => `${columnMap[key]} = $${index + 2}`).join(', ');
        const result = await (0, database_1.query)(`UPDATE problems SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [problemId, ...values]);
        if (result.rowCount === 0) {
            throw new Error('Problem not found');
        }
        return (0, persistence_1.mapProblemRow)(result.rows[0]);
    }
    async deleteProblem(problemId) {
        const result = await (0, database_1.query)('DELETE FROM problems WHERE id = $1 RETURNING *', [problemId]);
        if (result.rowCount === 0) {
            throw new Error('Problem not found');
        }
        return (0, persistence_1.mapProblemRow)(result.rows[0]);
    }
    async incrementSubmissionCount(problemId, accepted = false) {
        await (0, database_1.query)(`
        UPDATE problems
        SET
          submission_count = submission_count + 1,
          accepted_count = accepted_count + $2,
          updated_at = NOW()
        WHERE id = $1
      `, [problemId, accepted ? 1 : 0]);
    }
    async getCategories() {
        const result = await (0, database_1.query)('SELECT DISTINCT category FROM problems ORDER BY category ASC');
        return result.rows.map((row) => row.category);
    }
    async getProblemStats() {
        const result = await (0, database_1.query)(`
        SELECT
          difficulty AS _id,
          COUNT(*)::int AS count,
          COALESCE(SUM(submission_count), 0)::int AS "totalSubmissions",
          COALESCE(SUM(accepted_count), 0)::int AS "totalAccepted"
        FROM problems
        GROUP BY difficulty
      `);
        return result.rows;
    }
}
exports.default = new ProblemService();
//# sourceMappingURL=problemService.js.map