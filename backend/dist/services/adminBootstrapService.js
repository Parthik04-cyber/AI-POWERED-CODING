"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDefaultAdminAccount = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const persistence_1 = require("../utils/persistence");
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'parthikchadotara@gmail.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Khushi2004@';
const SYNC_DEFAULT_ADMIN_PASSWORD = (process.env.SYNC_DEFAULT_ADMIN_PASSWORD || 'false').toLowerCase() === 'true';
const DEFAULT_ADMIN_ROLE = 'admin';
const DEFAULT_ADMIN_FULL_NAME = process.env.DEFAULT_ADMIN_FULL_NAME || 'Platform Admin';
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const generateUniqueUsername = async (baseUsername) => {
    const exactMatch = await (0, persistence_1.usernameExists)(baseUsername);
    if (!exactMatch) {
        return baseUsername;
    }
    let suffix = 1;
    while (true) {
        const candidate = `${baseUsername}${suffix}`;
        const exists = await (0, persistence_1.usernameExists)(candidate);
        if (!exists) {
            return candidate;
        }
        suffix += 1;
    }
};
const ensureDefaultAdminAccount = async () => {
    const currentAdmin = await (0, persistence_1.getAnyAdminUser)();
    const existingAdmin = await (0, persistence_1.getUserByEmail)(DEFAULT_ADMIN_EMAIL, { includePassword: true });
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
                ? await bcrypt_1.default.compare(DEFAULT_ADMIN_PASSWORD, existingAdmin.password)
                : false;
            if (!isSamePassword) {
                existingAdmin.password = await bcrypt_1.default.hash(DEFAULT_ADMIN_PASSWORD, 10);
                updated = true;
            }
        }
        if (!existingAdmin.fullName) {
            existingAdmin.fullName = DEFAULT_ADMIN_FULL_NAME;
            updated = true;
        }
        if (updated) {
            await (0, persistence_1.saveUser)(existingAdmin);
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
    const createdUser = await (0, persistence_1.createUser)({
        username,
        email: DEFAULT_ADMIN_EMAIL,
        password: await bcrypt_1.default.hash(DEFAULT_ADMIN_PASSWORD, 10),
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
exports.ensureDefaultAdminAccount = ensureDefaultAdminAccount;
//# sourceMappingURL=adminBootstrapService.js.map