export interface CourseProgressRecord {
  completedLessonIds: string[];
  lastLessonId?: string;
}

interface ProgressStore {
  [userId: string]: {
    [courseId: string]: CourseProgressRecord;
  };
}

const COURSE_PROGRESS_KEY = 'course_progress_v1';
const COURSE_LESSON_MAP_KEY = 'course_lessons_v1';
const DEFAULT_USER_ID = 'guest';

const COURSE_LESSONS: Record<string, string[]> = {
  '1': ['intro', 'arrays-strings', 'hashing', 'linked-lists', 'stacks-queues', 'trees-graphs'],
  '2': ['intro', 'arrays-strings', 'hashing', 'linked-lists', 'stacks-queues', 'trees-graphs'],
  '3': ['intro', 'arrays-strings', 'hashing', 'linked-lists', 'stacks-queues', 'trees-graphs'],
  '4': ['intro', 'arrays-strings', 'hashing', 'linked-lists', 'stacks-queues', 'trees-graphs'],
};

interface CourseLessonMap {
  [courseId: string]: string[];
}

function getStore(): ProgressStore {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(COURSE_PROGRESS_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

function saveStore(store: ProgressStore): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(store));
}

function getLessonMap(): CourseLessonMap {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(COURSE_LESSON_MAP_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as CourseLessonMap;
  } catch {
    return {};
  }
}

function saveLessonMap(map: CourseLessonMap): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(COURSE_LESSON_MAP_KEY, JSON.stringify(map));
}

export function setCourseLessonIds(courseId: string, lessonIds: string[]): void {
  if (!courseId || lessonIds.length === 0) {
    return;
  }

  const normalized = lessonIds
    .map((lessonId) => lessonId.trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return;
  }

  const map = getLessonMap();
  map[courseId] = normalized;
  saveLessonMap(map);
}

export function getCourseLessons(courseId: string): string[] {
  const lessonMap = getLessonMap();
  const dynamicLessons = lessonMap[courseId];

  if (dynamicLessons && dynamicLessons.length > 0) {
    return dynamicLessons;
  }

  return COURSE_LESSONS[courseId] || COURSE_LESSONS['1'];
}

export async function fetchUserCourseProgress(userId: string, courseId: string): Promise<CourseProgressRecord> {
  // Async shape allows transparent switch to backend persistence later.
  const store = getStore();
  const resolvedUserId = userId || DEFAULT_USER_ID;

  return store[resolvedUserId]?.[courseId] || {
    completedLessonIds: [],
  };
}

export function saveUserCourseProgress(
  userId: string,
  courseId: string,
  progress: CourseProgressRecord
): void {
  const store = getStore();
  const resolvedUserId = userId || DEFAULT_USER_ID;

  store[resolvedUserId] = {
    ...(store[resolvedUserId] || {}),
    [courseId]: progress,
  };

  saveStore(store);
}

export function getNextIncompleteLesson(courseId: string, completedLessonIds: string[]): string {
  const lessons = getCourseLessons(courseId);
  return lessons.find((lessonId) => !completedLessonIds.includes(lessonId)) || lessons[0];
}

export async function getCourseResumeLesson(userId: string, courseId: string): Promise<string> {
  const progress = await fetchUserCourseProgress(userId, courseId);
  return getNextIncompleteLesson(courseId, progress.completedLessonIds || []);
}
