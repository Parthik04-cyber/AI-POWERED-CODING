'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { courseAPI } from '@/services/api';
import { CourseRecord, CourseStatus } from '@/types/learning';

const statusStyles: Record<CourseStatus, string> = {
  Published: 'bg-emerald-50 text-emerald-700',
  Draft: 'bg-slate-100 text-slate-700',
  Review: 'bg-amber-50 text-amber-700',
};

interface CourseForm {
  title: string;
  description: string;
  track: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  status: CourseStatus;
  lessonsInput: string;
}

const defaultForm: CourseForm = {
  title: '',
  description: '',
  track: '',
  difficulty: 'Intermediate',
  estimatedTime: '',
  status: 'Draft',
  lessonsInput: '',
};

const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(defaultForm);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAdminCourses();
      setCourses((response.data?.courses || []) as CourseRecord[]);
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const stats = useMemo(() => ({
    total: courses.length,
    published: courses.filter((item) => item.status === 'Published').length,
    review: courses.filter((item) => item.status === 'Review').length,
  }), [courses]);

  const resetForm = () => {
    setEditingCourseId(null);
    setForm(defaultForm);
  };

  const parseLessonsInput = (lessonsInput: string) =>
    lessonsInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title, index) => ({
        title,
        summary: `${title} learning notes`,
        content: `${title} detailed content goes here.`,
        order: index + 1,
      }));

  const handleEditCourse = (course: CourseRecord) => {
    setEditingCourseId(course._id);
    setForm({
      title: course.title,
      description: course.description || '',
      track: course.track || '',
      difficulty: course.difficulty || 'Intermediate',
      estimatedTime: course.estimatedTime || '',
      status: course.status,
      lessonsInput: course.lessons
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((lesson) => lesson.title)
        .join('\n'),
    });
  };

  const handleSaveCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    const lessons = parseLessonsInput(form.lessonsInput);
    if (lessons.length === 0) {
      setMessage('Add at least one lesson title.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      track: form.track.trim(),
      difficulty: form.difficulty,
      estimatedTime: form.estimatedTime.trim(),
      status: form.status,
      lessons,
    };

    try {
      setSaving(true);

      if (editingCourseId) {
        await courseAPI.updateCourse(editingCourseId, payload);
        setMessage('Course updated successfully.');
      } else {
        await courseAPI.createCourse(payload);
        setMessage('Course created successfully.');
      }

      resetForm();
      await loadCourses();
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (courseId: string, status: CourseStatus) => {
    try {
      await courseAPI.updateCourseStatus(courseId, status);
      setMessage(`Course moved to ${status}.`);
      await loadCourses();
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'Failed to update course status.');
    }
  };

  return (
    <AdminShell
      title="Course Management"
      description="Create, review, and publish courses from here. Published courses automatically appear on the learning platform."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Course plans</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Published</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stats.published}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">In review</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stats.review}</p>
          </div>
        </section>

        {message ? (
          <section className="rounded-3xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">
            {message}
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">{editingCourseId ? 'Edit course' : 'Create course'}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter one lesson title per line. Status controls visibility: only Published appears to users.
          </p>

          <form onSubmit={handleSaveCourse} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Course title"
              required
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            />
            <input
              value={form.track}
              onChange={(event) => setForm((prev) => ({ ...prev, track: event.target.value }))}
              placeholder="Track (e.g. Interview prep)"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            />
            <select
              value={form.difficulty}
              onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value as CourseForm['difficulty'] }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <input
              value={form.estimatedTime}
              onChange={(event) => setForm((prev) => ({ ...prev, estimatedTime: event.target.value }))}
              placeholder="Estimated time (e.g. 20 hrs)"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            />
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as CourseStatus }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 md:col-span-2"
            >
              <option value="Draft">Draft</option>
              <option value="Review">Review</option>
              <option value="Published">Published</option>
            </select>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Course description"
              className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 md:col-span-2"
            />
            <textarea
              value={form.lessonsInput}
              onChange={(event) => setForm((prev) => ({ ...prev, lessonsInput: event.target.value }))}
              placeholder={'Lesson 1\nLesson 2\nLesson 3'}
              required
              className="min-h-44 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 md:col-span-2"
            />
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingCourseId ? 'Update course' : 'Create course'}
              </button>
              {editingCourseId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600 xl:col-span-2">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600 xl:col-span-2">
              No courses found. Create your first course above.
            </div>
          ) : courses.map((course) => (
            <article key={course._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{course.track || 'General'}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{course.title}</h2>
                  {course.description ? <p className="mt-2 text-sm text-slate-600">{course.description}</p> : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[course.status]}`}>
                  {course.status}
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lesson count</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{course.lessons.length} lessons</p>
                {course.difficulty ? <p className="mt-1 text-xs text-slate-500">Difficulty: {course.difficulty}</p> : null}
                {course.estimatedTime ? <p className="mt-1 text-xs text-slate-500">Estimated: {course.estimatedTime}</p> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleUpdateStatus(course._id, 'Draft')}
                  className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Move to Draft
                </button>
                <button
                  onClick={() => handleUpdateStatus(course._id, 'Review')}
                  className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                >
                  Mark Review
                </button>
                <button
                  onClick={() => handleUpdateStatus(course._id, 'Published')}
                  className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                >
                  Publish
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminCoursesPage;