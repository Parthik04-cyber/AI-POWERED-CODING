'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@/layouts/MainLayout';

type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type FilterType = 'Global' | 'My Contests' | 'Past Contests';

interface ContestItem {
  id: string;
  name: string;
  startTime: string;
  problems: number;
  difficulty: DifficultyLevel;
  rewardCoins: number;
  isParticipating?: boolean;
}

interface RankedUser {
  id: number;
  username: string;
  rating: number;
  contestsAttended: number;
}

const upcomingContests: ContestItem[] = [
  {
    id: 'weekly-402',
    name: 'Weekly Contest 402',
    startTime: '2026-03-15T18:30:00',
    problems: 4,
    difficulty: 'Intermediate',
    rewardCoins: 260,
    isParticipating: true,
  },
  {
    id: 'biweekly-148',
    name: 'Biweekly Contest 148',
    startTime: '2026-03-20T20:00:00',
    problems: 4,
    difficulty: 'Advanced',
    rewardCoins: 420,
    isParticipating: false,
  },
  {
    id: 'starter-12',
    name: 'Starter Sprint 12',
    startTime: '2026-03-22T11:00:00',
    problems: 3,
    difficulty: 'Beginner',
    rewardCoins: 180,
    isParticipating: true,
  },
];

const pastContests: ContestItem[] = [
  {
    id: 'weekly-401',
    name: 'Weekly Contest 401',
    startTime: '2026-03-08T18:30:00',
    problems: 4,
    difficulty: 'Intermediate',
    rewardCoins: 250,
    isParticipating: true,
  },
  {
    id: 'biweekly-147',
    name: 'Biweekly Contest 147',
    startTime: '2026-03-01T20:00:00',
    problems: 4,
    difficulty: 'Advanced',
    rewardCoins: 400,
    isParticipating: false,
  },
  {
    id: 'weekly-400',
    name: 'Weekly Contest 400',
    startTime: '2026-02-23T18:30:00',
    problems: 4,
    difficulty: 'Intermediate',
    rewardCoins: 235,
    isParticipating: true,
  },
  {
    id: 'beginner-cup-9',
    name: 'Beginner Cup 9',
    startTime: '2026-02-15T10:00:00',
    problems: 3,
    difficulty: 'Beginner',
    rewardCoins: 140,
    isParticipating: false,
  },
];

const rankedUsers: RankedUser[] = [
  { id: 1, username: 'algoNinja', rating: 2840, contestsAttended: 58 },
  { id: 2, username: 'bitBuilder', rating: 2765, contestsAttended: 51 },
  { id: 3, username: 'stackStorm', rating: 2690, contestsAttended: 49 },
  { id: 4, username: 'graphGuru', rating: 2615, contestsAttended: 44 },
  { id: 5, username: 'dpWizard', rating: 2560, contestsAttended: 42 },
];

const filters: FilterType[] = ['Global', 'My Contests', 'Past Contests'];

const difficultyStyles: Record<DifficultyLevel, string> = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const formatCountdown = (targetTime: string) => {
  const difference = new Date(targetTime).getTime() - Date.now();

  if (difference <= 0) {
    return 'Live now';
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const getRecommendation = (contestStreak: number) => {
  if (contestStreak >= 8) {
    return {
      title: 'Biweekly Contest 148',
      reason: 'Your streak and intermediate success rate suggest you are ready for an advanced ladder push.',
      focus: 'Focus on graph problems and implementation speed.',
    };
  }

  return {
    title: 'Starter Sprint 12',
    reason: 'Your recent activity fits shorter contests with steady rating gains and lower penalty risk.',
    focus: 'Focus on arrays, strings, and clean debugging flow.',
  };
};

const ContestPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Global');
  const [countdowns, setCountdowns] = useState<Record<string, string>>(() =>
    upcomingContests.reduce<Record<string, string>>((timerMap, contest) => {
      timerMap[contest.id] = formatCountdown(contest.startTime);
      return timerMap;
    }, {})
  );

  const contestStreak = 9;
  const joinedContestCount = [...upcomingContests, ...pastContests].filter((contest) => contest.isParticipating).length;
  const recommendation = useMemo(() => getRecommendation(contestStreak), [contestStreak]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdowns(
        upcomingContests.reduce<Record<string, string>>((timerMap, contest) => {
          timerMap[contest.id] = formatCountdown(contest.startTime);
          return timerMap;
        }, {})
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const filteredPastContests = useMemo(() => {
    if (selectedFilter === 'My Contests') {
      return pastContests.filter((contest) => contest.isParticipating);
    }

    if (selectedFilter === 'Past Contests') {
      return pastContests;
    }

    return [...pastContests].sort(
      (firstContest, secondContest) => new Date(secondContest.startTime).getTime() - new Date(firstContest.startTime).getTime()
    );
  }, [selectedFilter]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-blue-50 px-6 py-8 shadow-card sm:px-8 lg:px-10">
          <div className="absolute -right-16 -top-14 h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-blue-200/30 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-500 shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                  <path d="M17 3V2H7v1H3v4a5 5 0 0 0 4 4.9V14a3 3 0 0 0 2 2.82V19H7v2h10v-2h-2v-2.18A3 3 0 0 0 17 14v-2.1A5 5 0 0 0 21 7V3h-4ZM5 7V5h2v4.82A3 3 0 0 1 5 7Zm14 0a3 3 0 0 1-2 2.82V5h2v2Z" />
                </svg>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                CodeMaster Contests
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Participate in weekly coding contests and improve your ranking.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#upcoming-contests"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-btn-primary transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600"
                >
                  Explore Upcoming Contests
                </a>
                <a
                  href="#contest-history"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                >
                  Practice Previous Rounds
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[29rem]">
              {[
                { label: 'Weekly Live', value: '3' },
                { label: 'Your Streak', value: `${contestStreak}` },
                { label: 'Coins Pool', value: '1.2K' },
                { label: 'Joined', value: `${joinedContestCount}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Leaderboard</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">Top Ranked</span>
              </div>

              <div className="mt-5 space-y-4">
                {rankedUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{user.username}</p>
                      <p className="text-sm text-slate-500">Rating {user.rating}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p className="font-semibold text-slate-700">{user.contestsAttended}</p>
                      <p>contests</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">AI Contest Recommendation</p>
              <h2 className="mt-3 text-2xl font-bold">{recommendation.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-200">{recommendation.reason}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Performance Focus</p>
                <p className="mt-2 text-sm text-slate-100">{recommendation.focus}</p>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Contest Streak</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{contestStreak}</p>
                <p className="mt-2 text-sm text-slate-600">You have participated in {contestStreak} contests continuously.</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Practice Mode</p>
                <p className="mt-3 text-xl font-bold text-slate-900">Replay archived contests</p>
                <p className="mt-2 text-sm text-slate-600">Start virtual runs with timers, locked hints, and post-contest analysis.</p>
              </div>
            </section>
          </aside>

          <div className="space-y-8">
            <section id="upcoming-contests">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Upcoming Contests</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Register for the next competitive rounds</h2>
                </div>
                <p className="hidden text-sm text-slate-500 md:block">Live countdown updates every second.</p>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                {upcomingContests.map((contest) => (
                  <article key={contest.id} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{contest.name.includes('Biweekly') ? 'Biweekly Contest' : contest.name.includes('Weekly') ? 'Weekly Contest' : 'Special Contest'}</p>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{contest.name}</h3>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyles[contest.difficulty]}`}>
                        {contest.difficulty}
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Starts</p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">{formatDateTime(contest.startTime)}</p>
                      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">Countdown</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{countdowns[contest.id]}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                      <span>{contest.problems} problems</span>
                      <span className="font-semibold text-amber-600">Reward {contest.rewardCoins} coins</span>
                    </div>

                    <button className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-600">
                      Join Contest
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Contest Rewards</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">Win reward coins for top ranks</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Top 10 finishers unlock coin bonuses, streak multipliers, and featured profile badges.</p>
              </div>
              <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Difficulty Ladder</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">Pick rounds that match your level</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Beginner rounds build consistency, intermediate rounds improve speed, advanced rounds sharpen contest strategy.</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Practice Mode</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">Replay past contests on demand</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use virtual practice to simulate the original timer, compare rank estimates, and review missed optimizations.</p>
              </div>
            </section>

            <section id="contest-history" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card sm:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Contest List</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Review completed contests and start practice runs</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => {
                    const isActive = selectedFilter === filter;

                    return (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredPastContests.map((contest) => (
                  <article key={contest.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 px-5 py-5 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">{contest.name}</h3>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyStyles[contest.difficulty]}`}>
                          {contest.difficulty}
                        </span>
                        {contest.isParticipating && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Participated
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span>Date: {formatDateTime(contest.startTime)}</span>
                        <span>Problems: {contest.problems}</span>
                        <span>Reward pool: {contest.rewardCoins} coins</span>
                      </div>
                    </div>

                    <button className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm">
                      Virtual Practice
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContestPage;