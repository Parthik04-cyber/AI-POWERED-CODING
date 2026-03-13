import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database';
import { ensureDefaultAdminAccount } from '../services/adminBootstrapService';

dotenv.config();

const run = async (): Promise<void> => {
  try {
    await connectDB();
    const result = await ensureDefaultAdminAccount();

    if (result.created) {
      console.log(`Created default admin account: ${result.email} (${result.username})`);
    } else if (result.updated) {
      console.log(`Updated default admin account: ${result.email} (${result.username})`);
    } else {
      console.log(`Default admin account already present: ${result.email} (${result.username})`);
    }
  } catch (error) {
    console.error('Failed to seed default admin account:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();
