"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProblemStats = exports.getCategories = exports.deleteProblem = exports.updateProblem = exports.createProblem = exports.getProblemById = exports.getAllProblems = void 0;
const problemService_1 = __importDefault(require("../services/problemService"));
const getAllProblems = async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const difficulty = req.query.difficulty;
        const category = req.query.category;
        const result = await problemService_1.default.getAllProblems(skip, limit, difficulty, category);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getAllProblems = getAllProblems;
const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await problemService_1.default.getProblemById(id);
        res.status(200).json(problem);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.getProblemById = getProblemById;
const createProblem = async (req, res) => {
    try {
        const problem = await problemService_1.default.createProblem(req.body);
        res.status(201).json(problem);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createProblem = createProblem;
const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await problemService_1.default.updateProblem(id, req.body);
        res.status(200).json(problem);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateProblem = updateProblem;
const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        await problemService_1.default.deleteProblem(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.deleteProblem = deleteProblem;
const getCategories = async (req, res) => {
    try {
        const categories = await problemService_1.default.getCategories();
        res.status(200).json({ categories });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getCategories = getCategories;
const getProblemStats = async (req, res) => {
    try {
        const stats = await problemService_1.default.getProblemStats();
        res.status(200).json({ stats });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.getProblemStats = getProblemStats;
//# sourceMappingURL=problemController.js.map