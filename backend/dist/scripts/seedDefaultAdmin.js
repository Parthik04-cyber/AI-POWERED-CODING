"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
const adminBootstrapService_1 = require("../services/adminBootstrapService");
dotenv_1.default.config();
const run = async () => {
    try {
        await (0, database_1.connectDB)();
        const result = await (0, adminBootstrapService_1.ensureDefaultAdminAccount)();
        if (result.created) {
            console.log(`Created default admin account: ${result.email} (${result.username})`);
        }
        else if (result.updated) {
            console.log(`Updated default admin account: ${result.email} (${result.username})`);
        }
        else {
            console.log(`Default admin account already present: ${result.email} (${result.username})`);
        }
    }
    catch (error) {
        console.error('Failed to seed default admin account:', error);
        process.exitCode = 1;
    }
    finally {
        await (0, database_1.disconnectDB)();
    }
};
run();
//# sourceMappingURL=seedDefaultAdmin.js.map