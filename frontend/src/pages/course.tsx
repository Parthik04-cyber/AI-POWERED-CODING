'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { courseAPI } from '@/services/api';
import { CourseRecord } from '@/types/learning';
import { useAuthStore } from '@/utils/store';
import {
  fetchUserCourseProgress,
  getNextIncompleteLesson,
  saveUserCourseProgress,
  setCourseLessonIds,
} from '@/services/learningProgressService';

const CoursePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLessonId, setActiveLessonId] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  const userId = user?.userId || 'guest';

  const sortedLessons = useMemo(
    () => (course?.lessons || []).slice().sort((a, b) => a.order - b.order),
    [course]
  );

  const lessonIndexMap = useMemo(
    () =>
      sortedLessons.reduce<Record<string, number>>((acc, lesson, index) => {
        acc[lesson.id] = index;
        return acc;
      }, {}),
    [sortedLessons]
  );

  const activeLesson = useMemo(
    () => sortedLessons.find((lesson) => lesson.id === activeLessonId) || sortedLessons[0],
    [activeLessonId, sortedLessons]
  );

  const completedCount = useMemo(
    () => Object.values(completedLessons).filter(Boolean).length,
    [completedLessons]
  );

  const progress = sortedLessons.length
    ? Math.round((completedCount / sortedLessons.length) * 100)
    : 0;

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    let mounted = true;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError('');

        const requestedCourseId =
          typeof router.query.courseId === 'string' ? router.query.courseId : '';

        let selectedCourse: CourseRecord | null = null;

        if (requestedCourseId) {
          const detailResponse = await courseAPI.getPublishedCourseById(requestedCourseId);
          selectedCourse = detailResponse.data as CourseRecord;
        } else {
          const listResponse = await courseAPI.getPublishedCourses();
          const published = (listResponse.data?.courses || []) as CourseRecord[];
          selectedCourse = published[0] || null;
        }

        if (!mounted) {
          return;
        }

        if (!selectedCourse) {
          setCourse(null);
          setError('No published course is available right now.');
          return;
        }

        setCourse(selectedCourse);

        const lessonIds = (selectedCourse.lessons || [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((lesson) => lesson.id);
        setCourseLessonIds(selectedCourse._id, lessonIds);

        const progressRecord = await fetchUserCourseProgress(userId, selectedCourse._id);
        if (!mounted) {
          return;
        }

        const completedMap = (progressRecord.completedLessonIds || []).reduce<Record<string, boolean>>(
          (acc, lessonId) => {
            acc[lessonId] = true;
            return acc;
          },
          {}
        );

        setCompletedLessons(completedMap);

        const queryLessonId = typeof router.query.lessonId === 'string' ? router.query.lessonId : '';
        const fallbackLesson = getNextIncompleteLesson(selectedCourse._id, progressRecord.completedLessonIds || []);

        setActiveLessonId(queryLessonId || fallbackLesson || lessonIds[0] || '');
      } catch (loadError: any) {
        if (!mounted) {
          return;
        }

        setError(loadError?.response?.data?.error || 'Failed to load this course.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCourse();

    return () => {
      mounted = false;
    };
  }, [router.isReady, router.query.courseId, router.query.lessonId, userId]);

  const markLessonComplete = (lessonId: string) => {
    if (!course) {
      return;
    }

    setCompletedLessons((prev) => {
      const next = { ...prev, [lessonId]: true };
      const completedLessonIds = Object.keys(next).filter((id) => next[id]);
      const nextLessonId = getNextIncompleteLesson(course._id, completedLessonIds);

      saveUserCourseProgress(userId, course._id, {
        completedLessonIds,
        lastLessonId: nextLessonId,
      });

      const nextIndex = lessonIndexMap[lessonId] + 1;
      const nextLesson = sortedLessons[nextIndex];
      if (nextLesson) {
        setActiveLessonId(nextLesson.id);
      }

      return next;
    });
  };

  return (
    <Layout>
      <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Loading course content...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
          ) : !course ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No course selected.
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">
                    {course.track || 'Learning Track'}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{course.title}</h1>
                  {course.description ? (
                    <p className="mt-2 text-slate-600 max-w-3xl">{course.description}</p>
                  ) : null}
                </div>
                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm min-w-[260px]">
                  <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
                    <span className="font-semibold">Course Progress</span>
                    <span className="font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {completedCount}/{sortedLessons.length} lessons complete
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6">
                <aside className="lg:sticky lg:top-20 h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 mb-3">Lessons</h2>
                  <div className="flex lg:block gap-2 overflow-x-auto pb-1 lg:overflow-visible">
                    {sortedLessons.map((lesson, index) => {
                      const isActive = lesson.id === activeLesson?.id;
                      const isDone = Boolean(completedLessons[lesson.id]);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`text-left min-w-[220px] lg:min-w-0 w-full rounded-xl px-3 py-3 border transition-all duration-200 ${
                            isActive
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-500">Lesson {index + 1}</span>
                            <span className={`text-xs font-bold ${isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {isDone ? 'Done' : 'Pending'}
                            </span>
                          </div>
                          <p className={`mt-1 text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                            {lesson.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <main className="space-y-6">
                  {activeLesson ? (
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                            Lesson {lessonIndexMap[activeLesson.id] + 1}
                          </p>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{activeLesson.title}</h2>
                        </div>
                        <button
                          onClick={() => markLessonComplete(activeLesson.id)}
                          className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                        >
                          Mark Complete
                        </button>
                      </div>

                      {activeLesson.summary ? (
                        <p className="text-slate-700 leading-relaxed">{activeLesson.summary}</p>
                      ) : (
                        <p className="text-slate-600">No lesson summary provided yet.</p>
                      )}

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                          Lesson Content
                        </p>
                        {activeLesson.content ? (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{activeLesson.content}</p>
                        ) : (
                          <p className="text-sm text-slate-500">Detailed lesson content will be added by admin.</p>
                        )}
                      </div>
                    </section>
                  ) : (
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 text-sm text-slate-600">
                      This course has no lessons yet.
                    </section>
                  )}
                </main>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CoursePage;
