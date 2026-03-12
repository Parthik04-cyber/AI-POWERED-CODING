import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthResponse {
  user: {
    userId: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
  private jwtExpire = process.env.JWT_EXPIRE || '7d';

  generateToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, this.jwtSecret, { expiresIn: this.jwtExpire });
  }

  async register(username: string, email: string, password: string, fullName: string): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = new User({ username, email, password, fullName, role: 'user' });
    await user.save();

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getUserProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUserProfile(userId: string, updateData: Partial<IUser>) {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export default new AuthService();
