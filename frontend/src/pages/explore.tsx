'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import LearningPackCard from '@/components/LearningPackCard';
import LearningPathCard from '@/components/LearningPathCard';
import CompanyCard from '@/components/CompanyCard';
import RecommendationCard from '@/components/RecommendationCard';
import MiniTestCard from '@/components/MiniTestCard';
import AILearningAssistant from '@/components/AILearningAssistant';
import GamificationBadges from '@/components/GamificationBadges';
import { CourseRecord, LearningPack, LearningPath, CompanyPack, Recommendation, MiniTest } from '@/types/learning';
import { useAuthStore } from '@/utils/store';
import { getCourseResumeLesson, setCourseLessonIds } from '@/services/learningProgressService';
import { courseAPI } from '@/services/api';

const Explore: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [publishedCourses, setPublishedCourses] = useState<CourseRecord[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPublishedCourses = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError('');
        const response = await courseAPI.getPublishedCourses();
        if (!mounted) {
          return;
        }

        const courses = (response.data?.courses || []) as CourseRecord[];
        setPublishedCourses(courses);

        courses.forEach((course) => {
          const lessonIds = (course.lessons || [])
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((lesson) => lesson.id);
          setCourseLessonIds(course._id, lessonIds);
        });
      } catch (error: any) {
        if (!mounted) {
          return;
        }
        setCoursesError(error?.response?.data?.error || 'Failed to load published courses.');
      } finally {
        if (mounted) {
          setCoursesLoading(false);
        }
      }
    };

    void loadPublishedCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredPacks: LearningPack[] = useMemo(
    () =>
      publishedCourses.map((course, index) => ({
        id: course._id,
        title: course.title,
        description: course.description || 'Structured course designed by admin authors.',
        chapters: course.lessons.length,
        problemsCount: course.lessons.length,
        progress: 0,
        difficulty: course.difficulty || 'Intermediate',
        icon: '📘',
        color: index % 2 === 0 ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-teal-500',
        estimatedTime: course.estimatedTime || 'Flexible',
      })),
    [publishedCourses]
  );

  const learningPaths: LearningPath[] = [
    {
      id: 'path-1',
      title: 'Beginner Coding Path',
      description: 'Start from scratch and build a strong foundation in programming fundamentals.',
      difficulty: 'Beginner',
      icon: '🌱',
      modules: 8,
      progress: 45,
      estimatedDuration: '8 weeks',
      skills: ['Variables', 'Loops', 'Functions', 'Arrays', 'Strings'],
    },
    {
      id: 'path-2',
      title: 'DSA Master Path',
      description: 'Complete journey through data structures and algorithm mastery for interviews.',
      difficulty: 'Advanced',
      icon: '🚀',
      modules: 15,
      progress: 35,
      estimatedDuration: '12 weeks',
      skills: ['Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching'],
    },
    {
      id: 'path-3',
      title: 'Backend Developer Path',
      description: 'Learn backend development with databases, APIs, and system design.',
      difficulty: 'Intermediate',
      icon: '⚡',
      modules: 12,
      progress: 60,
      estimatedDuration: '10 weeks',
      skills: ['Node.js', 'Databases', 'REST APIs', 'Authentication', 'Caching'],
    },
    {
      id: 'path-4',
      title: 'System Design Path',
      description: 'Master designing large-scale systems like tech companies do.',
      difficulty: 'Advanced',
      icon: '🌐',
      modules: 10,
      progress: 20,
      estimatedDuration: '8 weeks',
      skills: ['Scalability', 'Load Balancing', 'Databases', 'Caching', 'Messaging'],
    },
  ];

  const companyPacks: CompanyPack[] = [
    {
      id: 'company-1',
      company: 'Google',
      logo: '🔵',
      topicsCount: 28,
      problemsCount: 145,
      difficulty: 'Advanced',
      lastUpdated: '2 weeks ago',
      progress: 55,
    },
    {
      id: 'company-2',
      company: 'Amazon',
      logo: '🟠',
      topicsCount: 32,
      problemsCount: 168,
      difficulty: 'Advanced',
      lastUpdated: '1 week ago',
      progress: 42,
    },
    {
      id: 'company-3',
      company: 'Microsoft',
      logo: '⬜',
      topicsCount: 26,
      problemsCount: 138,
      difficulty: 'Intermediate',
      lastUpdated: '3 weeks ago',
      progress: 65,
    },
    {
      id: 'company-4',
      company: 'Apple',
      logo: '🍎',
      topicsCount: 24,
      problemsCount: 125,
      difficulty: 'Advanced',
      lastUpdated: '10 days ago',
      progress: 38,
    },
  ];

  const recommendations: Recommendation[] = [
    {
      id: 'rec-1',
      type: 'topic',
      title: 'Binary Search Trees',
      reason: 'You\'ve completed basic trees. Next step is mastering BSTs.',
      difficulty: 'Medium',
      estimatedTime: '4 hrs',
    },
    {
      id: 'rec-2',
      type: 'learning_path',
      title: 'Backend Developer Path',
      reason: 'Based on your system design progress, this path matches your interests.',
      difficulty: 'Intermediate',
      estimatedTime: '10 weeks',
    },
    {
      id: 'rec-3',
      type: 'problem',
      title: 'Two Sum Problem',
      reason: 'Great for strengthening your array manipulation skills.',
      difficulty: 'Easy',
      estimatedTime: '20 mins',
    },
    {
      id: 'rec-4',
      type: 'topic',
      title: 'Graph Algorithms',
      reason: 'Next advanced topic in your learning journey.',
      difficulty: 'Hard',
      estimatedTime: '6 hrs',
    },
  ];

  const miniTests: MiniTest[] = [
    {
      id: 'test-1',
      title: 'Array Operations Quiz',
      topic: 'Arrays & Vectors',
      questionsCount: 10,
      difficulty: 'Easy',
      timeLimit: 15,
      averageScore: 88,
    },
    {
      id: 'test-2',
      title: 'Tree Traversal Challenge',
      topic: 'Trees',
      questionsCount: 15,
      difficulty: 'Medium',
      timeLimit: 25,
      averageScore: 72,
    },
    {
      id: 'test-3',
      title: 'Graph Algorithms Mastery',
      topic: 'Graphs',
      questionsCount: 20,
      difficulty: 'Hard',
      timeLimit: 40,
      averageScore: 65,
    },
    {
      id: 'test-4',
      title: 'Dynamic Programming Fundamentals',
      topic: 'Dynamic Programming',
      questionsCount: 12,
      difficulty: 'Medium',
      timeLimit: 30,
      averageScore: 58,
    },
  ];

  const handleViewPack = async (courseId: string) => {
    const resumeLessonId = await getCourseResumeLesson(user?.userId || 'guest', courseId);
    router.push(`/explore/course/${courseId}?lessonId=${encodeURIComponent(resumeLessonId)}`);
  };

  const handleViewPath = (pathId: string) => {
    router.push(`/learning-path/${pathId}`);
  };

  const handleTakeTest = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const handleExploreCompanyPack = (companyName: string) => {
    router.push(`/company/${encodeURIComponent(companyName)}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Explore & Learn</h1>
          <p className="text-lg text-slate-500">
            Structured learning modules to master coding interviews and build your career
          </p>
        </div>

        {/* Featured Learning Packs Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Learning Packs</h2>
              <p className="text-sm text-slate-500 mt-1">Master essential concepts with comprehensive modules</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coursesLoading ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Loading published courses...
              </div>
            ) : coursesError ? (
              <div className="col-span-full rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {coursesError}
              </div>
            ) : featuredPacks.length === 0 ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                No published courses are available yet.
              </div>
            ) : (
              featuredPacks.map((pack) => (
                <LearningPackCard key={pack.id} pack={pack} onView={handleViewPack} />
              ))
            )}
          </div>
        </section>

        {/* Learning Paths Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Learning Paths</h2>
              <p className="text-sm text-slate-500 mt-1">Structured roadmaps for different skill levels</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <LearningPathCard key={path.id} path={path} onView={handleViewPath} />
            ))}
          </div>
        </section>

        {/* Interview Preparation Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Company-Specific Interview Prep</h2>
              <p className="text-sm text-slate-500 mt-1">Learn exactly what each company asks in their interviews</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyPacks.map((company) => (
              <CompanyCard key={company.id} company={company} onView={handleExploreCompanyPack} />
            ))}
          </div>
        </section>

        {/* Recommendations Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Personalized Recommendations</h2>
              <p className="text-sm text-slate-500 mt-1">Tailored suggestions based on your learning progress</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} onView={handleViewPack} />
            ))}
          </div>
        </section>

        {/* Mini Tests Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Topic-Based Mini Tests</h2>
              <p className="text-sm text-slate-500 mt-1">Quick assessments to gauge your understanding</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {miniTests.map((test) => (
              <MiniTestCard key={test.id} test={test} onTake={handleTakeTest} />
            ))}
          </div>
        </section>

        {/* Gamification & Achievements Section */}
        <section className="mb-14">
          <GamificationBadges earnedPoints={2450} currentStreak={7} />
        </section>

        {/* Quick Stats Section */}
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">42</div>
              <div className="text-sm text-blue-700">Problems Solved This Week</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 text-center">
              <div className="text-4xl font-bold text-purple-900 mb-2">65%</div>
              <div className="text-sm text-purple-700">Overall Progress</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6 text-center">
              <div className="text-4xl font-bold text-green-900 mb-2">8</div>
              <div className="text-sm text-green-700">Days Learning Streak</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6 text-center">
              <div className="text-4xl font-bold text-orange-900 mb-2">12</div>
              <div className="text-sm text-orange-700">Badges Earned</div>
            </div>
          </div>
        </section>
      </div>

      {/* AI Learning Assistant */}
      <AILearningAssistant />
    </Layout>
  );
};

export default Explore;
