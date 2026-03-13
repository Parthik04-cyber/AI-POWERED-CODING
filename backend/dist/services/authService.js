"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const persistence_1 = require("../utils/persistence");
class AuthService {
    getJwtSecret() {
        return process.env.JWT_SECRET || 'your_jwt_secret_key';
    }
    getJwtExpire() {
        return (process.env.JWT_EXPIRE || '7d');
    }
    generateToken(userId, email, role) {
        return jsonwebtoken_1.default.sign({ userId, email, role }, this.getJwtSecret(), { expiresIn: this.getJwtExpire() });
    }
    async register(username, email, password, fullName) {
        const existingUser = await (0, persistence_1.emailOrUsernameExists)(email, username);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await (0, persistence_1.createUser)({
            username,
            email,
            password: hashedPassword,
            fullName,
            role: 'user',
        });
        const token = this.generateToken(user._id, user.email, user.role);
        return {
            user: {
                userId: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                coins: user.coins || 0,
                codingStreak: user.codingStreak || 0,
                isPremium: !!user.isPremium,
                premiumExpiresAt: user.premiumExpiresAt,
                badges: user.badges || [],
            },
            token,
        };
    }
    async login(email, password) {
        const user = await (0, persistence_1.getUserByEmail)(email, { includePassword: true });
        if (!user || !user.password || !(await bcrypt_1.default.compare(password, user.password))) {
            throw new Error('Invalid email or password');
        }
        const token = this.generateToken(user._id, user.email, user.role);
        return {
            user: {
                userId: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                coins: user.coins || 0,
                codingStreak: user.codingStreak || 0,
                isPremium: !!user.isPremium,
                premiumExpiresAt: user.premiumExpiresAt,
                badges: user.badges || [],
            },
            token,
        };
    }
    async getUserProfile(userId) {
        const user = await (0, persistence_1.getUserById)(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateUserProfile(userId, updateData) {
        const columnMap = {
            fullName: 'full_name',
            bio: 'bio',
            profileImage: 'profile_image',
        };
        const entries = Object.entries(updateData).filter(([key, value]) => columnMap[key] && value !== undefined);
        if (entries.length === 0) {
            const unchangedUser = await (0, persistence_1.getUserById)(userId);
            if (!unchangedUser) {
                throw new Error('User not found');
            }
            return unchangedUser;
        }
        const values = entries.map(([, value]) => value);
        const setClause = entries.map(([key], index) => `${columnMap[key]} = $${index + 2}`).join(', ');
        const result = await (0, database_1.query)(`UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [userId, ...values]);
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
        return (0, persistence_1.mapUserRow)(result.rows[0]);
    }
    async getAllUsers() {
        const result = await (0, database_1.query)('SELECT * FROM users ORDER BY created_at DESC');
        return result.rows.map((row) => (0, persistence_1.mapUserRow)(row));
    }
}
exports.default = new AuthService();
//# sourceMappingURL=authService.js.map