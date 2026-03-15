import bcrypt from 'bcrypt';
import { createUser, getAnyAdminUser, getUserByEmail, saveUser, usernameExists } from '../utils/persistence';

interface EnsureAdminResult {
  created: boolean;
  updated: boolean;
  email: string;
  username: string;
}

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'parthikchadotara@gmail.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Khushi2004@';
const SYNC_DEFAULT_ADMIN_PASSWORD = (process.env.SYNC_DEFAULT_ADMIN_PASSWORD || 'false').toLowerCase() === 'true';
const DEFAULT_ADMIN_ROLE = 'admin';
const DEFAULT_ADMIN_FULL_NAME = process.env.DEFAULT_ADMIN_FULL_NAME || 'Platform Admin';
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';

const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
  const exactMatch = await usernameExists(baseUsername);
  if (!exactMatch) {
    return baseUsername;
  }

  let suffix = 1;
  while (true) {
    const candidate = `${baseUsername}${suffix}`;
    const exists = await usernameExists(candidate);
    if (!exists) {
      return candidate;
    }
    suffix += 1;
  }
};

export const ensureDefaultAdminAccount = async (): Promise<EnsureAdminResult> => {
  const currentAdmin = await getAnyAdminUser();
  const existingAdmin = await getUserByEmail(DEFAULT_ADMIN_EMAIL, { includePassword: true });

  if (existingAdmin) {
    let updated = false;

    if (existingAdmin.role !== DEFAULT_ADMIN_ROLE) {
      if (!currentAdmin) {
        existingAdmin.role = DEFAULT_ADMIN_ROLE;
        updated = true;
      }
    }

    if (SYNC_DEFAULT_ADMIN_PASSWORD) {
      const isSamePassword = existingAdmin.password
        ? await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, existingAdmin.password)
        : false;
      if (!isSamePassword) {
        existingAdmin.password = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
        updated = true;
      }
    }

    if (!existingAdmin.fullName) {
      existingAdmin.fullName = DEFAULT_ADMIN_FULL_NAME;
      updated = true;
    }

    if (updated) {
      await saveUser(existingAdmin);
    }

    return {
      created: false,
      updated,
      email: existingAdmin.email,
      username: existingAdmin.username,
    };
  }

  if (currentAdmin) {
    return {
      created: false,
      updated: false,
      email: currentAdmin.email,
      username: currentAdmin.username,
    };
  }

  const username = await generateUniqueUsername(DEFAULT_ADMIN_USERNAME);
  const createdUser = await createUser({
    username,
    email: DEFAULT_ADMIN_EMAIL,
    password: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10),
    fullName: DEFAULT_ADMIN_FULL_NAME,
    role: DEFAULT_ADMIN_ROLE,
  });

  return {
    created: true,
    updated: false,
    email: createdUser.email,
    username: createdUser.username,
  };
};
