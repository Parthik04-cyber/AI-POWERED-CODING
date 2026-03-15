"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const persistence_1 = require("../utils/persistence");
const toDate = (value) => (value instanceof Date ? value : new Date(value));
const toApiStatus = (status) => {
    if (status === 'published')
        return 'Published';
    if (status === 'review')
        return 'Review';
    return 'Draft';
};
const toDbStatus = (status) => {
    const normalized = status.trim().toLowerCase();
    if (normalized === 'published') {
        return 'published';
    }
    if (normalized === 'review') {
        return 'review';
    }
    if (normalized === 'draft') {
        return 'draft';
    }
    throw new Error('Status must be Draft, Review, or Published');
};
const normalizeLessons = (value) => {
    if (value === undefined || value === null) {
        return [];
    }
    if (!Array.isArray(value)) {
        throw new Error('Lessons must be an array');
    }
    return value.map((lessonRaw, index) => {
        const lesson = lessonRaw;
        const title = typeof lesson.title === 'string' ? lesson.title.trim() : '';
        if (!title) {
            throw new Error(`Lesson ${index + 1} must include a title`);
        }
        const explicitOrder = Number(lesson.order);
        return {
            id: typeof lesson.id === 'string' && lesson.id.trim() ? lesson.id : (0, persistence_1.generateId)(),
            title,
            summary: typeof lesson.summary === 'string' && lesson.summary.trim() ? lesson.summary.trim() : undefined,
            content: typeof lesson.content === 'string' && lesson.content.trim() ? lesson.content.trim() : undefined,
            order: Number.isFinite(explicitOrder) ? explicitOrder : index + 1,
        };
    });
};
const mapCourseRow = (row) => ({
    _id: String(row.id),
    title: row.title,
    description: row.description || undefined,
    track: row.track || undefined,
    difficulty: row.difficulty || undefined,
    estimatedTime: row.estimated_time || undefined,
    status: toApiStatus(row.status),
    lessons: normalizeLessons(Array.isArray(row.lessons) ? row.lessons : []),
    createdBy: row.created_by || undefined,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
});
class CourseService {
    async getPublishedCourses() {
        const result = await (0, database_1.query)(`
        SELECT *
        FROM courses
        WHERE status = 'published'
        ORDER BY updated_at DESC
      `);
        return result.rows.map(mapCourseRow);
    }
    async getPublishedCourseById(courseId) {
        const result = await (0, database_1.query)(`
        SELECT *
        FROM courses
        WHERE id = $1 AND status = 'published'
        LIMIT 1
      `, [courseId]);
        if (result.rowCount === 0) {
            throw new Error('Published course not found');
        }
        return mapCourseRow(result.rows[0]);
    }
    async getAdminCourses(status) {
        const values = [];
        const where = [];
        if (status && status.trim()) {
            values.push(toDbStatus(status));
            where.push(`status = $${values.length}`);
        }
        const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
        const result = await (0, database_1.query)(`
        SELECT *
        FROM courses
        ${whereClause}
        ORDER BY updated_at DESC
      `, values);
        return result.rows.map(mapCourseRow);
    }
    async getAdminCourseById(courseId) {
        const result = await (0, database_1.query)('SELECT * FROM courses WHERE id = $1 LIMIT 1', [courseId]);
        if (result.rowCount === 0) {
            throw new Error('Course not found');
        }
        return mapCourseRow(result.rows[0]);
    }
    async createCourse(payload, createdBy) {
        const title = (payload.title || '').trim();
        if (!title) {
            throw new Error('Title is required');
        }
        const normalizedLessons = normalizeLessons(payload.lessons || []);
        const result = await (0, database_1.query)(`
        INSERT INTO courses (
          id,
          title,
          description,
          track,
          difficulty,
          estimated_time,
          status,
          lessons,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, NOW(), NOW())
        RETURNING *
      `, [
            (0, persistence_1.generateId)(),
            title,
            payload.description || null,
            payload.track || null,
            payload.difficulty || null,
            payload.estimatedTime || null,
            toDbStatus(payload.status || 'Draft'),
            JSON.stringify(normalizedLessons),
            createdBy || null,
        ]);
        return mapCourseRow(result.rows[0]);
    }
    async updateCourse(courseId, payload) {
        const existing = await this.getAdminCourseById(courseId);
        const nextTitle = payload.title !== undefined ? payload.title.trim() : existing.title;
        if (!nextTitle) {
            throw new Error('Title is required');
        }
        const nextLessons = payload.lessons !== undefined ? normalizeLessons(payload.lessons) : existing.lessons;
        const result = await (0, database_1.query)(`
        UPDATE courses
        SET
          title = $2,
          description = $3,
          track = $4,
          difficulty = $5,
          estimated_time = $6,
          status = $7,
          lessons = $8::jsonb,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [
            courseId,
            nextTitle,
            payload.description !== undefined ? payload.description : existing.description || null,
            payload.track !== undefined ? payload.track : existing.track || null,
            payload.difficulty !== undefined ? payload.difficulty : existing.difficulty || null,
            payload.estimatedTime !== undefined ? payload.estimatedTime : existing.estimatedTime || null,
            payload.status !== undefined ? toDbStatus(payload.status) : toDbStatus(existing.status),
            JSON.stringify(nextLessons),
        ]);
        if (result.rowCount === 0) {
            throw new Error('Course not found');
        }
        return mapCourseRow(result.rows[0]);
    }
    async updateCourseStatus(courseId, status) {
        const result = await (0, database_1.query)(`
        UPDATE courses
        SET status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [courseId, toDbStatus(status)]);
        if (result.rowCount === 0) {
            throw new Error('Course not found');
        }
        return mapCourseRow(result.rows[0]);
    }
}
exports.default = new CourseService();
//# sourceMappingURL=courseService.js.map