"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCourseStatus = exports.updateCourse = exports.createCourse = exports.getAdminCourseById = exports.getAdminCourses = exports.getPublishedCourseById = exports.getPublishedCourses = void 0;
const courseService_1 = __importDefault(require("../services/courseService"));
const getPublishedCourses = async (_req, res) => {
    try {
        const courses = await courseService_1.default.getPublishedCourses();
        res.status(200).json({ courses });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to load courses' });
    }
};
exports.getPublishedCourses = getPublishedCourses;
const getPublishedCourseById = async (req, res) => {
    try {
        const course = await courseService_1.default.getPublishedCourseById(req.params.id);
        res.status(200).json(course);
    }
    catch (error) {
        res.status(404).json({ error: error.message || 'Course not found' });
    }
};
exports.getPublishedCourseById = getPublishedCourseById;
const getAdminCourses = async (req, res) => {
    try {
        const status = req.query.status;
        const courses = await courseService_1.default.getAdminCourses(status);
        res.status(200).json({ courses });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to load admin courses' });
    }
};
exports.getAdminCourses = getAdminCourses;
const getAdminCourseById = async (req, res) => {
    try {
        const course = await courseService_1.default.getAdminCourseById(req.params.id);
        res.status(200).json(course);
    }
    catch (error) {
        res.status(404).json({ error: error.message || 'Course not found' });
    }
};
exports.getAdminCourseById = getAdminCourseById;
const createCourse = async (req, res) => {
    try {
        const course = await courseService_1.default.createCourse(req.body, req.user?.userId);
        res.status(201).json(course);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create course' });
    }
};
exports.createCourse = createCourse;
const updateCourse = async (req, res) => {
    try {
        const course = await courseService_1.default.updateCourse(req.params.id, req.body);
        res.status(200).json(course);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update course' });
    }
};
exports.updateCourse = updateCourse;
const updateCourseStatus = async (req, res) => {
    try {
        const status = req.body?.status || '';
        const course = await courseService_1.default.updateCourseStatus(req.params.id, status);
        res.status(200).json(course);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update course status' });
    }
};
exports.updateCourseStatus = updateCourseStatus;
//# sourceMappingURL=courseController.js.map