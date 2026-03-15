"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const auth_1 = require("./middleware/auth");
const adminBootstrapService_1 = require("./services/adminBootstrapService");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const problemRoutes_1 = __importDefault(require("./routes/problemRoutes"));
const submissionRoutes_1 = __importDefault(require("./routes/submissionRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const executeRoutes_1 = __importDefault(require("./routes/executeRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const contestRoutes_1 = __importDefault(require("./routes/contestRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const isAllowedOrigin = (origin) => {
    if (!origin) {
        return true;
    }
    if (configuredOrigins.includes(origin)) {
        return true;
    }
    if ((process.env.NODE_ENV || 'development') !== 'production') {
        return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
    }
    return false;
};
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS blocked for origin: ${origin || 'unknown'}`));
    },
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/problems', problemRoutes_1.default);
app.use('/api/submissions', submissionRoutes_1.default);
app.use('/api/leaderboard', leaderboardRoutes_1.default);
app.use('/api/execute', executeRoutes_1.default);
app.use('/api/store', storeRoutes_1.default);
app.use('/api/contests', contestRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use(auth_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        const adminSetup = await (0, adminBootstrapService_1.ensureDefaultAdminAccount)();
        if (adminSetup.created) {
            console.log(`✓ Default admin created: ${adminSetup.email}`);
        }
        else if (adminSetup.updated) {
            console.log(`✓ Default admin updated: ${adminSetup.email}`);
        }
        else {
            console.log(`✓ Default admin already exists: ${adminSetup.email}`);
        }
        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('✗ Server startup failed:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map