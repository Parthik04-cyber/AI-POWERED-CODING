import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';
import { query } from '../config/database';
import { createUser, emailOrUsernameExists, getUserByEmail, getUserById, mapUserRow } from '../utils/persistence';

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
  private getJwtSecret(): Secret {
    return process.env.JWT_SECRET || 'your_jwt_secret_key';
  }

  private getJwtExpire(): SignOptions['expiresIn'] {
    return (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'];
  }

  generateToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, this.getJwtSecret(), { expiresIn: this.getJwtExpire() });
  }

  async register(username: string, email: string, password: string, fullName: string): Promise<AuthResponse> {
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
}

export default new AuthService();
