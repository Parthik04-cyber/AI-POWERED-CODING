"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const persistence_1 = require("../utils/persistence");
const emailService_1 = __importDefault(require("./emailService"));
const accessService_1 = require("./accessService");
class AuthService {
    constructor() {
        this.minimumPasswordLength = 8;
    }
    getJwtSecret() {
        return process.env.JWT_SECRET || 'your_jwt_secret_key';
    }
    getJwtExpire() {
        return (process.env.JWT_EXPIRE || '7d');
    }
    getPasswordResetExpiryMinutes() {
        const minutes = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES || 30);
        return Number.isFinite(minutes) && minutes > 0 ? minutes : 30;
    }
    getPasswordResetBaseUrl() {
        const configuredUrl = process.env.PASSWORD_RESET_URL;
        if (configuredUrl) {
            return configuredUrl;
        }
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
        return `${frontendUrl}/reset-password`;
    }
    hashPasswordResetToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    buildPasswordResetUrl(token) {
        const url = new URL(this.getPasswordResetBaseUrl());
        url.searchParams.set('token', token);
        return url.toString();
    }
    validatePasswordStrength(password) {
        if (!password || password.length < this.minimumPasswordLength) {
            throw new Error(`Password must be at least ${this.minimumPasswordLength} characters long`);
        }
    }
    async updateUserPassword(userId, password) {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await (0, database_1.query)('UPDATE users SET password = $2, updated_at = NOW() WHERE id = $1', [userId, hashedPassword]);
        if ((result.rowCount || 0) === 0) {
            throw new Error('User not found');
        }
    }
    generateToken(userId, email, role) {
        return jsonwebtoken_1.default.sign({ userId, email, role }, this.getJwtSecret(), { expiresIn: this.getJwtExpire() });
    }
    async register(username, email, password, fullName) {
        this.validatePasswordStrength(password);
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
        if ((0, accessService_1.ensureTrialStarted)(user)) {
            await (0, persistence_1.saveUser)(user);
        }
        const accessState = (0, accessService_1.getUserAccessState)(user);
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
                trialStartedAt: user.trialStartedAt,
                trialEndsAt: accessState.trialEndsAt,
                hasActiveAccess: accessState.hasAccess,
                accessStatus: accessState.status,
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
        if ((0, accessService_1.ensureTrialStarted)(user)) {
            await (0, persistence_1.saveUser)(user);
        }
        const accessState = (0, accessService_1.getUserAccessState)(user);
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
                trialStartedAt: user.trialStartedAt,
                trialEndsAt: accessState.trialEndsAt,
                hasActiveAccess: accessState.hasAccess,
                accessStatus: accessState.status,
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
    async forgotPassword(email) {
        const user = await (0, persistence_1.getUserByEmail)(email, { includeRelations: false });
        const genericMessage = 'If an account exists for that email, a password reset link has been generated.';
        if (!user) {
            return { message: genericMessage, delivery: 'manual' };
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = this.hashPasswordResetToken(resetToken);
        const expiresInMinutes = this.getPasswordResetExpiryMinutes();
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        await (0, database_1.query)('DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at <= NOW() OR used_at IS NOT NULL', [user._id]);
        await (0, database_1.query)(`
        INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [(0, persistence_1.generateId)(), user._id, tokenHash, expiresAt]);
        const resetUrl = this.buildPasswordResetUrl(resetToken);
        const delivered = await emailService_1.default.sendPasswordResetEmail({
            to: email,
            resetUrl,
            expiryMinutes: expiresInMinutes,
        });
        if (delivered) {
            return {
                message: genericMessage,
                expiresAt,
                delivery: 'email',
            };
        }
        if ((process.env.NODE_ENV || 'development') !== 'production') {
            console.log(`Password reset link for ${email}: ${resetUrl}`);
            return {
                message: `${genericMessage} Email delivery is not configured, so the reset link is returned directly.`,
                expiresAt,
                resetToken,
                resetUrl,
                delivery: 'manual',
            };
        }
        console.log(`Password reset requested for ${email}. Configure email delivery or use the reset CLI if needed.`);
        return {
            message: `${genericMessage} Email delivery is not configured on this backend. Use the reset CLI or direct token flow.`,
            expiresAt,
            delivery: 'manual',
        };
    }
    async resetPassword(token, newPassword) {
        this.validatePasswordStrength(newPassword);
        const tokenHash = this.hashPasswordResetToken(token);
        await (0, database_1.withTransaction)(async (client) => {
            const result = await (0, database_1.query)(`
          SELECT id, user_id
          FROM password_reset_tokens
          WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1
          FOR UPDATE
        `, [tokenHash], client);
            const resetRecord = result.rows[0];
            if (!resetRecord) {
                throw new Error('Invalid or expired reset token');
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            const updateUserResult = await (0, database_1.query)('UPDATE users SET password = $2, updated_at = NOW() WHERE id = $1', [resetRecord.user_id, hashedPassword], client);
            if ((updateUserResult.rowCount || 0) === 0) {
                throw new Error('User not found');
            }
            await (0, database_1.query)('UPDATE password_reset_tokens SET used_at = NOW(), updated_at = NOW() WHERE id = $1', [resetRecord.id], client);
            await (0, database_1.query)('DELETE FROM password_reset_tokens WHERE user_id = $1 AND id <> $2', [resetRecord.user_id, resetRecord.id], client);
        });
    }
    async changePassword(userId, currentPassword, newPassword) {
        this.validatePasswordStrength(newPassword);
        const user = await (0, persistence_1.getUserById)(userId, { includePassword: true, includeRelations: false });
        if (!user || !user.password || !(await bcrypt_1.default.compare(currentPassword, user.password))) {
            throw new Error('Current password is incorrect');
        }
        if (await bcrypt_1.default.compare(newPassword, user.password)) {
            throw new Error('New password must be different from the current password');
        }
        await this.updateUserPassword(userId, newPassword);
    }
}
exports.default = new AuthService();
//# sourceMappingURL=authService.js.map