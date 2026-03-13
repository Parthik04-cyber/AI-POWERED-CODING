"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const persistence_1 = require("../utils/persistence");
const PROBLEM_COIN_REWARDS = {
    Easy: 5,
    Medium: 10,
    Hard: 20,
};
const PREMIUM_PLAN_COSTS = {
    monthly: 120,
    yearly: 1200,
};
const ACTIVITY_REWARDS = {
    contest: 30,
    interview: 25,
};
const LUCKY_SPIN_REWARDS = [0, 5, 10, 15, 25, 50, 75];
const STORE_ITEMS = [
    {
        id: 'premium-monthly',
        title: 'Premium Subscription - Monthly',
        description: 'Unlock premium features for one month.',
        cost: PREMIUM_PLAN_COSTS.monthly,
        section: 'premium',
    },
    {
        id: 'premium-yearly',
        title: 'Premium Subscription - Yearly',
        description: 'Best value yearly premium plan.',
        cost: PREMIUM_PLAN_COSTS.yearly,
        section: 'premium',
    },
    {
        id: 'resource-dsa-pack',
        title: 'DSA Mastery Resource Pack',
        description: 'Downloadable curated guides and templates.',
        cost: 90,
        section: 'redeem',
    },
    {
        id: 'resource-system-design',
        title: 'System Design Crash Kit',
        description: 'High-impact architecture notes and checklists.',
        cost: 140,
        section: 'redeem',
    },
    {
        id: 'merch-sticker-pack',
        title: 'CodeMaster Sticker Pack',
        description: 'Premium sticker set for your setup.',
        cost: 60,
        section: 'redeem',
    },
    {
        id: 'merch-tshirt',
        title: 'CodeMaster T-Shirt',
        description: 'Exclusive platform merchandise.',
        cost: 180,
        section: 'redeem',
    },
];
const ACHIEVEMENTS = [
    {
        id: 'first-solve',
        title: 'First Solve',
        description: 'Solve your first coding problem.',
    },
    {
        id: 'problem-hunter',
        title: 'Problem Hunter',
        description: 'Solve at least 10 problems.',
    },
    {
        id: 'coin-collector',
        title: 'Coin Collector',
        description: 'Accumulate 100+ coins.',
    },
    {
        id: 'streak-starter',
        title: 'Streak Starter',
        description: 'Claim daily login rewards for 3 consecutive days.',
    },
    {
        id: 'premium-member',
        title: 'Premium Member',
        description: 'Activate any premium subscription plan.',
    },
];
class StoreService {
    normalizeDateToUTC(date) {
        return date.toISOString().slice(0, 10);
    }
    updateCodingStreak(user, solvedAt) {
        const solvedDay = this.normalizeDateToUTC(solvedAt);
        const lastSolvedDay = user.lastSolvedProblemAt
            ? this.normalizeDateToUTC(user.lastSolvedProblemAt)
            : null;
        if (lastSolvedDay === solvedDay) {
            return;
        }
        if (lastSolvedDay) {
            const previous = new Date(solvedAt);
            previous.setUTCDate(previous.getUTCDate() - 1);
            const previousDay = this.normalizeDateToUTC(previous);
            user.codingStreak = lastSolvedDay === previousDay ? (user.codingStreak || 0) + 1 : 1;
        }
        else {
            user.codingStreak = 1;
        }
        user.lastSolvedProblemAt = solvedAt;
    }
    ensurePremiumState(user) {
        if (user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
            user.isPremium = false;
            user.premiumPlan = undefined;
        }
    }
    async createTransaction(userId, type, title, coinsDelta, balanceAfter, itemId, metadata, client) {
        await (0, database_1.query)(`
        INSERT INTO store_transactions (
          id, user_id, type, item_id, title, coins_delta, balance_after, metadata, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [(0, persistence_1.generateId)(), userId, type, itemId || null, title, coinsDelta, balanceAfter, metadata || {}], client);
    }
    updateAchievementBadges(user) {
        const nextBadges = new Set(user.badges || []);
        if ((user.problemsSolved || 0) >= 1)
            nextBadges.add('first-solve');
        if ((user.problemsSolved || 0) >= 10)
            nextBadges.add('problem-hunter');
        if ((user.coins || 0) >= 100)
            nextBadges.add('coin-collector');
        if ((user.dailyLoginStreak || 0) >= 3)
            nextBadges.add('streak-starter');
        if (user.isPremium)
            nextBadges.add('premium-member');
        user.badges = Array.from(nextBadges);
    }
    toSafeUserState(user) {
        return {
            coins: user.coins || 0,
            isPremium: !!user.isPremium,
            premiumPlan: user.premiumPlan || null,
            premiumExpiresAt: user.premiumExpiresAt || null,
            dailyLoginStreak: user.dailyLoginStreak || 0,
            codingStreak: user.codingStreak || 0,
            badges: user.badges || [],
            premiumFeatures: user.isPremium
                ? [
                    'AI code review',
                    'Premium interview questions',
                    'Advanced analytics',
                    'Exclusive learning content',
                ]
                : [],
        };
    }
    async getStoreOverview(userId) {
        return (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                throw new Error('User not found');
            }
            this.ensurePremiumState(user);
            this.updateAchievementBadges(user);
            const persistedUser = await (0, persistence_1.saveUser)(user, client);
            const recentTransactionsResult = await (0, database_1.query)(`
          SELECT * FROM store_transactions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 10
        `, [userId], client);
            const coinLeaderboardResult = await (0, database_1.query)(`
          SELECT id, username, full_name, coins, is_premium, problems_solved
          FROM users
          ORDER BY coins DESC, updated_at ASC
          LIMIT 10
        `, [], client);
            return {
                user: this.toSafeUserState(persistedUser),
                coinRewards: {
                    problem: PROBLEM_COIN_REWARDS,
                    activity: ACTIVITY_REWARDS,
                },
                sections: {
                    redeem: STORE_ITEMS.filter((item) => item.section === 'redeem'),
                    premium: STORE_ITEMS.filter((item) => item.section === 'premium'),
                },
                achievements: ACHIEVEMENTS.map((achievement) => ({
                    ...achievement,
                    unlocked: (persistedUser.badges || []).includes(achievement.id),
                })),
                purchaseHistory: recentTransactionsResult.rows.map((row) => (0, persistence_1.mapStoreTransactionRow)(row)),
                coinLeaderboard: coinLeaderboardResult.rows.map((row) => ({
                    _id: String(row.id),
                    username: row.username,
                    fullName: row.full_name,
                    coins: Number(row.coins || 0),
                    isPremium: Boolean(row.is_premium),
                    problemsSolved: Number(row.problems_solved || 0),
                })),
            };
        });
    }
    async getPurchaseHistory(userId, limit = 30) {
        const result = await (0, database_1.query)(`
        SELECT * FROM store_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [userId, limit]);
        return result.rows.map((row) => (0, persistence_1.mapStoreTransactionRow)(row));
    }
    async redeemItem(userId, itemId) {
        const item = STORE_ITEMS.find((entry) => entry.id === itemId && entry.section === 'redeem');
        if (!item) {
            throw new Error('Redeem item not found');
        }
        return (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                throw new Error('User not found');
            }
            if ((user.coins || 0) < item.cost) {
                throw new Error('Not enough coins to redeem this item');
            }
            user.coins = (user.coins || 0) - item.cost;
            this.updateAchievementBadges(user);
            const persistedUser = await (0, persistence_1.saveUser)(user, client);
            await this.createTransaction(userId, 'redeem', item.title, -item.cost, persistedUser.coins, item.id, { section: 'redeem' }, client);
            return {
                message: `${item.title} redeemed successfully`,
                coins: persistedUser.coins,
                item,
            };
        });
    }
    async subscribePremium(userId, plan) {
        const planCost = PREMIUM_PLAN_COSTS[plan];
        if (!planCost) {
            throw new Error('Invalid premium plan');
        }
        return (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                throw new Error('User not found');
            }
            if ((user.coins || 0) < planCost) {
                throw new Error('Not enough coins for this premium plan');
            }
            const now = new Date();
            const baseDate = user.premiumExpiresAt && user.premiumExpiresAt > now ? user.premiumExpiresAt : now;
            const nextExpiry = new Date(baseDate);
            if (plan === 'monthly') {
                nextExpiry.setMonth(nextExpiry.getMonth() + 1);
            }
            else {
                nextExpiry.setFullYear(nextExpiry.getFullYear() + 1);
            }
            user.coins = (user.coins || 0) - planCost;
            user.isPremium = true;
            user.premiumPlan = plan;
            user.premiumExpiresAt = nextExpiry;
            this.updateAchievementBadges(user);
            const persistedUser = await (0, persistence_1.saveUser)(user, client);
            await this.createTransaction(userId, 'premium_purchase', `Premium ${plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan`, -planCost, persistedUser.coins, `premium-${plan}`, { plan, expiresAt: nextExpiry.toISOString() }, client);
            return {
                message: 'Premium activated successfully',
                coins: persistedUser.coins,
                premiumPlan: persistedUser.premiumPlan,
                premiumExpiresAt: persistedUser.premiumExpiresAt,
                premiumFeatures: [
                    'AI code review',
                    'Premium interview questions',
                    'Advanced analytics',
                    'Exclusive learning content',
                ],
            };
        });
    }
    async claimDailyLoginReward(userId) {
        return (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                throw new Error('User not found');
            }
            const now = new Date();
            const today = this.normalizeDateToUTC(now);
            const lastLogin = user.lastDailyLoginAt ? this.normalizeDateToUTC(user.lastDailyLoginAt) : null;
            if (lastLogin === today) {
                throw new Error('Daily login reward already claimed today');
            }
            const yesterdayDate = new Date(now);
            yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
            const yesterday = this.normalizeDateToUTC(yesterdayDate);
            user.dailyLoginStreak = lastLogin === yesterday ? (user.dailyLoginStreak || 0) + 1 : 1;
            const reward = Math.min(15 + (user.dailyLoginStreak - 1) * 2, 30);
            user.coins = (user.coins || 0) + reward;
            user.lastDailyLoginAt = now;
            this.updateAchievementBadges(user);
            const persistedUser = await (0, persistence_1.saveUser)(user, client);
            await this.createTransaction(userId, 'daily_login', `Daily login reward (streak ${persistedUser.dailyLoginStreak})`, reward, persistedUser.coins, undefined, { streak: persistedUser.dailyLoginStreak }, client);
            return {
                message: 'Daily reward claimed',
                streak: persistedUser.dailyLoginStreak,
                reward,
                coins: persistedUser.coins,
            };
        });
    }
    async spinLuckyWheel(userId) {
        return (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                throw new Error('User not found');
            }
            const now = new Date();
            if (user.lastLuckySpinAt) {
                const elapsed = now.getTime() - user.lastLuckySpinAt.getTime();
                if (elapsed < 24 * 60 * 60 * 1000) {
                    throw new Error('Lucky spin is available once every 24 hours');
                }
            }
            const reward = LUCKY_SPIN_REWARDS[Math.floor(Math.random() * LUCKY_SPIN_REWARDS.length)];
            user.coins = (user.coins || 0) + reward;
            user.lastLuckySpinAt = now;
            this.updateAchievementBadges(user);
            const persistedUser = await (0, persistence_1.saveUser)(user, client);
            await this.createTransaction(userId, 'lucky_spin', 'Lucky spin reward', reward, persistedUser.coins, undefined, { reward }, client);
            return {
                message: reward > 0 ? `You won ${reward} coins!` : 'No coins this spin. Try again tomorrow!',
                reward,
                coins: persistedUser.coins,
            };
        });
    }
    async rewardActivity(userId, activityType, referenceId) {
        const reward = ACTIVITY_REWARDS[activityType];
        if (!reward) {
            throw new Error('Unsupported activity type');
        }
        if (!referenceId || !referenceId.trim()) {
            throw new Error('Reference ID is required');
        }
        return (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                throw new Error('User not found');
            }
            const activityRef = `${activityType}:${referenceId.trim()}`;
            if ((user.completedActivityRefs || []).includes(activityRef)) {
                throw new Error('Reward already claimed for this activity');
            }
            user.completedActivityRefs = [...(user.completedActivityRefs || []), activityRef];
            user.coins = (user.coins || 0) + reward;
            this.updateAchievementBadges(user);
            const persistedUser = await (0, persistence_1.saveUser)(user, client);
            await this.createTransaction(userId, activityType === 'contest' ? 'contest_reward' : 'interview_reward', `${activityType === 'contest' ? 'Contest' : 'Interview'} completion reward`, reward, persistedUser.coins, activityRef, { activityType, referenceId }, client);
            return {
                message: `${activityType} reward claimed`,
                reward,
                coins: persistedUser.coins,
            };
        });
    }
    async rewardProblemSolve(userId, problemId) {
        return (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                throw new Error('User not found');
            }
            user.totalSubmissions = (user.totalSubmissions || 0) + 1;
            this.updateCodingStreak(user, new Date());
            const alreadySolved = (user.solvedProblemIds || []).includes(problemId);
            if (alreadySolved) {
                this.updateAchievementBadges(user);
                await (0, persistence_1.saveUser)(user, client);
                return { awarded: false, coinsAwarded: 0 };
            }
            const problemResult = await (0, database_1.query)('SELECT id, difficulty FROM problems WHERE id = $1', [problemId], client);
            const problem = problemResult.rows[0];
            if (!problem) {
                await (0, persistence_1.saveUser)(user, client);
                return { awarded: false, coinsAwarded: 0 };
            }
            const reward = PROBLEM_COIN_REWARDS[problem.difficulty] || 5;
            user.solvedProblemIds = [...(user.solvedProblemIds || []), problemId];
            user.problemsSolved = (user.problemsSolved || 0) + 1;
            user.score = (user.score || 0) + 10;
            user.coins = (user.coins || 0) + reward;
            this.updateAchievementBadges(user);
            const persistedUser = await (0, persistence_1.saveUser)(user, client);
            await this.createTransaction(userId, 'problem_solve', `${problem.difficulty} problem solved`, reward, persistedUser.coins, problemId, { difficulty: problem.difficulty }, client);
            return { awarded: true, coinsAwarded: reward };
        });
    }
    async recordFailedSubmission(userId) {
        await (0, database_1.withTransaction)(async (client) => {
            const user = await (0, persistence_1.getUserById)(userId, { client });
            if (!user) {
                return;
            }
            user.totalSubmissions = (user.totalSubmissions || 0) + 1;
            this.updateAchievementBadges(user);
            await (0, persistence_1.saveUser)(user, client);
        });
    }
    async getCoinLeaderboard(limit = 20) {
        const result = await (0, database_1.query)(`
        SELECT id, username, full_name, coins, is_premium, problems_solved
        FROM users
        ORDER BY coins DESC, problems_solved DESC, updated_at ASC
        LIMIT $1
      `, [limit]);
        return result.rows.map((row) => ({
            _id: String(row.id),
            username: row.username,
            fullName: row.full_name,
            coins: Number(row.coins || 0),
            isPremium: Boolean(row.is_premium),
            problemsSolved: Number(row.problems_solved || 0),
        }));
    }
    async getAchievements(userId) {
        const user = await (0, persistence_1.getUserById)(userId, { includeRelations: false });
        if (!user) {
            throw new Error('User not found');
        }
        return ACHIEVEMENTS.map((achievement) => ({
            ...achievement,
            unlocked: (user.badges || []).includes(achievement.id),
        }));
    }
}
exports.default = new StoreService();
//# sourceMappingURL=storeService.js.map