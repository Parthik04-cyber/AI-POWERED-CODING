import { IProblem } from '../models/Problem';
import { query } from '../config/database';
import { generateId, mapProblemRow } from '../utils/persistence';

class ProblemService {
  async getAllProblems(skip: number = 0, limit: number = 10, difficulty?: string, category?: string) {
    const conditions: string[] = [];
    const values: unknown[] = [];

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
    const problemsResult = await query<any>(
      `
        SELECT * FROM problems
        ${whereClause}
        ORDER BY created_at DESC
        OFFSET $${values.length + 1}
        LIMIT $${values.length + 2}
      `,
      listValues
    );
    const totalResult = await query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM problems ${whereClause}`,
      values
    );

    const problems = problemsResult.rows.map((row) => mapProblemRow(row));
    const total = Number(totalResult.rows[0]?.total || 0);

    return { problems, total, skip, limit };
  }

  async getProblemById(problemId: string) {
    const result = await query<any>('SELECT * FROM problems WHERE id = $1', [problemId]);
    if (result.rowCount === 0) {
      throw new Error('Problem not found');
    }
    return mapProblemRow(result.rows[0]);
  }

  async createProblem(problemData: Partial<IProblem>) {
    const result = await query<any>(
      `
        INSERT INTO problems (
          id, title, description, difficulty, category, tags, examples, constraints,
          test_cases, time_limit, memory_limit, submission_count, accepted_count, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        RETURNING *
      `,
      [
        generateId(),
        problemData.title,
        problemData.description,
        problemData.difficulty,
        problemData.category,
        problemData.tags || [],
        problemData.examples || [],
        problemData.constraints || [],
        problemData.testCases || [],
        problemData.timeLimit ?? 5,
        problemData.memoryLimit ?? 256,
        problemData.submissionCount ?? 0,
        problemData.acceptedCount ?? 0,
      ]
    );

    return mapProblemRow(result.rows[0]);
  }

  async updateProblem(problemId: string, updateData: Partial<IProblem>) {
    const columnMap: Record<string, string> = {
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

    const values = entries.map(([, value]) => value);
    const setClause = entries.map(([key], index) => `${columnMap[key]} = $${index + 2}`).join(', ');
    const result = await query<any>(
      `UPDATE problems SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [problemId, ...values]
    );

    if (result.rowCount === 0) {
      throw new Error('Problem not found');
    }

    return mapProblemRow(result.rows[0]);
  }

  async deleteProblem(problemId: string) {
    const result = await query<any>('DELETE FROM problems WHERE id = $1 RETURNING *', [problemId]);
    if (result.rowCount === 0) {
      throw new Error('Problem not found');
    }
    return mapProblemRow(result.rows[0]);
  }

  async incrementSubmissionCount(problemId: string, accepted: boolean = false) {
    await query(
      `
        UPDATE problems
        SET
          submission_count = submission_count + 1,
          accepted_count = accepted_count + $2,
          updated_at = NOW()
        WHERE id = $1
      `,
      [problemId, accepted ? 1 : 0]
    );
  }

  async getCategories() {
    const result = await query<{ category: string }>('SELECT DISTINCT category FROM problems ORDER BY category ASC');
    return result.rows.map((row) => row.category);
  }

  async getProblemStats() {
    const result = await query<any>(
      `
        SELECT
          difficulty AS _id,
          COUNT(*)::int AS count,
          COALESCE(SUM(submission_count), 0)::int AS "totalSubmissions",
          COALESCE(SUM(accepted_count), 0)::int AS "totalAccepted"
        FROM problems
        GROUP BY difficulty
      `
    );

    return result.rows;
  }
}

export default new ProblemService();
