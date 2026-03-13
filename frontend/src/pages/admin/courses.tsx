'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { adminCoursePlans } from '@/components/admin/adminData';

const statusStyles: Record<string, string> = {
  Published: 'bg-emerald-50 text-emerald-700',
  Draft: 'bg-slate-100 text-slate-700',
  Review: 'bg-amber-50 text-amber-700',
};

const AdminCoursesPage: React.FC = () => {
  return (
    <AdminShell
      title="Course Management"
      description="Learning paths and curriculum work belong here. This keeps course planning separate from dashboard reporting."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Course plans</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{adminCoursePlans.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Published</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{adminCoursePlans.filter((item) => item.status === 'Published').length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">In review</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{adminCoursePlans.filter((item) => item.status === 'Review').length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Course authoring currently lives in frontend content and local progress storage. Dedicated admin write APIs are still needed before this page can support publishing workflows.
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {adminCoursePlans.map((course) => (
            <article key={course.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{course.track}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{course.title}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[course.status]}`}>
                  {course.status}
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lesson count</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{course.lessons} lessons</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminCoursesPage;