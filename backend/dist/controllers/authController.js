"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const authService_1 = __importDefault(require("../services/authService"));
const register = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        if (!username || !email || !password || !fullName) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const result = await authService_1.default.register(username, email, password, fullName);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const result = await authService_1.default.login(email, password);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await authService_1.default.getUserProfile(req.user.userId);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const allowedFields = ['fullName', 'bio', 'profileImage'];
        const updateData = {};
        allowedFields.forEach((field) => {
            if (field in req.body) {
                updateData[field] = req.body[field];
            }
        });
        const user = await authService_1.default.updateUserProfile(req.user.userId, updateData);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const users = await authService_1.default.getAllUsers();
        res.status(200).json({ users });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=authController.js.map