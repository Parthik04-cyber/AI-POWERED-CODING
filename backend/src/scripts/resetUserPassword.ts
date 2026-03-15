import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { connectDB, disconnectDB, query } from '../config/database';

dotenv.config();

const usage = (): void => {
  console.log('Usage: npm run reset:password -- --email user@example.com --password NewSecurePassword123');
};

const readArg = (name: string): string | undefined => {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length).trim();
  }

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) {
    return process.argv[index + 1]?.trim();
  }

  return undefined;
};

const run = async (): Promise<void> => {
  const email = readArg('email');
  const password = readArg('password');

  if (!email || !password) {
    usage();
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters long.');
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    const userResult = await query<{ id: string; username: string }>('SELECT id, username FROM users WHERE email = $1 LIMIT 1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      console.error(`No user found for email: ${email}`);
      process.exitCode = 1;
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query('UPDATE users SET password = $2, updated_at = NOW() WHERE id = $1', [user.id, passwordHash]);
    await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

    console.log(`Password updated successfully for ${email} (${user.username}).`);
  } catch (error) {
    console.error('Failed to reset password:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();