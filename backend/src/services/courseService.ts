import { query } from '../config/database';
import { CourseStatus, ICourse, ICourseLesson } from '../models/Course';
import { generateId } from '../utils/persistence';

type DbCourseStatus = 'draft' | 'review' | 'published';

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  track: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  status: DbCourseStatus;
  lessons: unknown;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type CourseLessonInput = {
  id?: unknown;
  title?: unknown;
  summary?: unknown;
  content?: unknown;
  order?: unknown;
};

const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

const toApiStatus = (status: DbCourseStatus): CourseStatus => {
  if (status === 'published') return 'Published';
  if (status === 'review') return 'Review';
  return 'Draft';
};

const toDbStatus = (status: string): DbCourseStatus => {
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

const normalizeLessons = (value: unknown): ICourseLesson[] => {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Lessons must be an array');
  }

  return value.map((lessonRaw, index) => {
    const lesson = lessonRaw as CourseLessonInput;
    const title = typeof lesson.title === 'string' ? lesson.title.trim() : '';

    if (!title) {
      throw new Error(`Lesson ${index + 1} must include a title`);
    }

    const explicitOrder = Number(lesson.order);
    return {
      id: typeof lesson.id === 'string' && lesson.id.trim() ? lesson.id : generateId(),
      title,
      summary: typeof lesson.summary === 'string' && lesson.summary.trim() ? lesson.summary.trim() : undefined,
      content: typeof lesson.content === 'string' && lesson.content.trim() ? lesson.content.trim() : undefined,
      order: Number.isFinite(explicitOrder) ? explicitOrder : index + 1,
    };
  });
};

const mapCourseRow = (row: CourseRow): ICourse => ({
  _id: String(row.id),
  title: row.title,
  description: row.description || undefined,
  track: row.track || undefined,
  difficulty: (row.difficulty as ICourse['difficulty']) || undefined,
  estimatedTime: row.estimated_time || undefined,
  status: toApiStatus(row.status),
  lessons: normalizeLessons(Array.isArray(row.lessons) ? row.lessons : []),
  createdBy: row.created_by || undefined,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

class CourseService {
  async getPublishedCourses(): Promise<ICourse[]> {
    const result = await query<CourseRow>(
      `
        SELECT *
        FROM courses
        WHERE status = 'published'
        ORDER BY updated_at DESC
      `
    );

    return result.rows.map(mapCourseRow);
  }

  async getPublishedCourseById(courseId: string): Promise<ICourse> {
    const result = await query<CourseRow>(
      `
        SELECT *
        FROM courses
        WHERE id = $1 AND status = 'published'
        LIMIT 1
      `,
      [courseId]
    );

    if (result.rowCount === 0) {
      throw new Error('Published course not found');
    }

    return mapCourseRow(result.rows[0]);
  }

  async getAdminCourses(status?: string): Promise<ICourse[]> {
    const values: unknown[] = [];
    const where: string[] = [];

    if (status && status.trim()) {
      values.push(toDbStatus(status));
      where.push(`status = $${values.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const result = await query<CourseRow>(
      `
        SELECT *
        FROM courses
        ${whereClause}
        ORDER BY updated_at DESC
      `,
      values
    );

    return result.rows.map(mapCourseRow);
  }

  async getAdminCourseById(courseId: string): Promise<ICourse> {
    const result = await query<CourseRow>('SELECT * FROM courses WHERE id = $1 LIMIT 1', [courseId]);

    if (result.rowCount === 0) {
      throw new Error('Course not found');
    }

    return mapCourseRow(result.rows[0]);
  }

  async createCourse(payload: Partial<ICourse>, createdBy?: string): Promise<ICourse> {
    const title = (payload.title || '').trim();
    if (!title) {
      throw new Error('Title is required');
    }

    const normalizedLessons = normalizeLessons(payload.lessons || []);

    const result = await query<CourseRow>(
      `
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
      `,
      [
        generateId(),
        title,
        payload.description || null,
        payload.track || null,
        payload.difficulty || null,
        payload.estimatedTime || null,
        toDbStatus(payload.status || 'Draft'),
        JSON.stringify(normalizedLessons),
        createdBy || null,
      ]
    );

    return mapCourseRow(result.rows[0]);
  }

  async updateCourse(courseId: string, payload: Partial<ICourse>): Promise<ICourse> {
    const existing = await this.getAdminCourseById(courseId);

    const nextTitle = payload.title !== undefined ? payload.title.trim() : existing.title;
    if (!nextTitle) {
      throw new Error('Title is required');
    }

    const nextLessons = payload.lessons !== undefined ? normalizeLessons(payload.lessons) : existing.lessons;

    const result = await query<CourseRow>(
      `
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
      `,
      [
        courseId,
        nextTitle,
        payload.description !== undefined ? payload.description : existing.description || null,
        payload.track !== undefined ? payload.track : existing.track || null,
        payload.difficulty !== undefined ? payload.difficulty : existing.difficulty || null,
        payload.estimatedTime !== undefined ? payload.estimatedTime : existing.estimatedTime || null,
        payload.status !== undefined ? toDbStatus(payload.status) : toDbStatus(existing.status),
        JSON.stringify(nextLessons),
      ]
    );

    if (result.rowCount === 0) {
      throw new Error('Course not found');
    }

    return mapCourseRow(result.rows[0]);
  }

  async updateCourseStatus(courseId: string, status: string): Promise<ICourse> {
    const result = await query<CourseRow>(
      `
        UPDATE courses
        SET status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [courseId, toDbStatus(status)]
    );

    if (result.rowCount === 0) {
      throw new Error('Course not found');
    }

    return mapCourseRow(result.rows[0]);
  }
}

export default new CourseService();
