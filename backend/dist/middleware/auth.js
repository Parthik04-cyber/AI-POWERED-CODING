"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.adminMiddleware = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuthMiddleware = (req, _res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
        }
    }
    catch (_e) {
        // Ignore invalid tokens — just proceed without user
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admin only.' });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=auth.js.map