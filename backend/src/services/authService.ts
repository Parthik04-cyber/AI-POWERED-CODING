import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';
import { query, withTransaction } from '../config/database';
import { createUser, emailOrUsernameExists, generateId, getUserByEmail, getUserById, mapUserRow } from '../utils/persistence';
import emailService from './emailService';

export interface AuthResponse {
  user: {
    userId: string;
    username: string;
    email: string;
    role: string;
    fullName?: string;
    coins: number;
    codingStreak: number;
    isPremium: boolean;
    premiumExpiresAt?: Date;
    badges: string[];
  };
  token: string;
}

class AuthService {
  private readonly minimumPasswordLength = 8;

  private getJwtSecret(): Secret {
    return process.env.JWT_SECRET || 'your_jwt_secret_key';
  }

  private getJwtExpire(): SignOptions['expiresIn'] {
    return (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'];
  }

  private getPasswordResetExpiryMinutes(): number {
    const minutes = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES || 30);
    return Number.isFinite(minutes) && minutes > 0 ? minutes : 30;
  }

  private getPasswordResetBaseUrl(): string {
    const configuredUrl = process.env.PASSWORD_RESET_URL;
    if (configuredUrl) {
      return configuredUrl;
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return `${frontendUrl}/reset-password`;
  }

  private hashPasswordResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildPasswordResetUrl(token: string): string {
    const url = new URL(this.getPasswordResetBaseUrl());
    url.searchParams.set('token', token);
    return url.toString();
  }

  private validatePasswordStrength(password: string): void {
    if (!password || password.length < this.minimumPasswordLength) {
      throw new Error(`Password must be at least ${this.minimumPasswordLength} characters long`);
    }
  }

  private async updateUserPassword(userId: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query('UPDATE users SET password = $2, updated_at = NOW() WHERE id = $1', [userId, hashedPassword]);

    if ((result.rowCount || 0) === 0) {
      throw new Error('User not found');
    }
  }

  generateToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, this.getJwtSecret(), { expiresIn: this.getJwtExpire() });
  }

  async register(username: string, email: string, password: string, fullName: string): Promise<AuthResponse> {
    this.validatePasswordStrength(password);

    const existingUser = await emailOrUsernameExists(email, username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
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

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await getUserByEmail(email, { includePassword: true });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
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

  async getUserProfile(userId: string) {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUserProfile(userId: string, updateData: Partial<IUser>) {
    const columnMap: Record<string, string> = {
      fullName: 'full_name',
      bio: 'bio',
      profileImage: 'profile_image',
    };

    const entries = Object.entries(updateData).filter(([key, value]) => columnMap[key] && value !== undefined);
    if (entries.length === 0) {
      const unchangedUser = await getUserById(userId);
      if (!unchangedUser) {
        throw new Error('User not found');
      }
      return unchangedUser;
    }

    const values = entries.map(([, value]) => value);
    const setClause = entries.map(([key], index) => `${columnMap[key]} = $${index + 2}`).join(', ');
    const result = await query<any>(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId, ...values]
    );

    if (result.rowCount === 0) {
      throw new Error('User not found');
    }

    return mapUserRow(result.rows[0]);
  }

  async getAllUsers() {
    const result = await query<any>('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map((row) => mapUserRow(row));
  }

  async forgotPassword(email: string): Promise<{
    message: string;
    expiresAt?: Date;
    resetToken?: string;
    resetUrl?: string;
    delivery: 'manual' | 'email';
  }> {
    const user = await getUserByEmail(email, { includeRelations: false });
    const genericMessage = 'If an account exists for that email, a password reset link has been generated.';

    if (!user) {
      return { message: genericMessage, delivery: 'manual' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashPasswordResetToken(resetToken);
    const expiresInMinutes = this.getPasswordResetExpiryMinutes();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await query('DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at <= NOW() OR used_at IS NOT NULL', [user._id]);
    await query(
      `
        INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `,
      [generateId(), user._id, tokenHash, expiresAt]
    );

    const resetUrl = this.buildPasswordResetUrl(resetToken);
    const delivered = await emailService.sendPasswordResetEmail({
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

  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.validatePasswordStrength(newPassword);
    const tokenHash = this.hashPasswordResetToken(token);

    await withTransaction(async (client) => {
      const result = await query<{ id: string; user_id: string }>(
        `
          SELECT id, user_id
          FROM password_reset_tokens
          WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1
          FOR UPDATE
        `,
        [tokenHash],
        client
      );

      const resetRecord = result.rows[0];
      if (!resetRecord) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateUserResult = await query(
        'UPDATE users SET password = $2, updated_at = NOW() WHERE id = $1',
        [resetRecord.user_id, hashedPassword],
        client
      );

      if ((updateUserResult.rowCount || 0) === 0) {
        throw new Error('User not found');
      }

      await query('UPDATE password_reset_tokens SET used_at = NOW(), updated_at = NOW() WHERE id = $1', [resetRecord.id], client);
      await query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND id <> $2', [resetRecord.user_id, resetRecord.id], client);
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    this.validatePasswordStrength(newPassword);
    const user = await getUserById(userId, { includePassword: true, includeRelations: false });

    if (!user || !user.password || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new Error('Current password is incorrect');
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      throw new Error('New password must be different from the current password');
    }

    await this.updateUserPassword(userId, newPassword);
  }
}

export default new AuthService();
