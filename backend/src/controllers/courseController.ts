import { Request, Response } from 'express';
import courseService from '../services/courseService';

export const getPublishedCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await courseService.getPublishedCourses();
    res.status(200).json({ courses });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load courses' });
  }
};

export const getPublishedCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await courseService.getPublishedCourseById(req.params.id);
    res.status(200).json(course);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Course not found' });
  }
};

export const getAdminCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const courses = await courseService.getAdminCourses(status);
    res.status(200).json({ courses });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load admin courses' });
  }
};

export const getAdminCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await courseService.getAdminCourseById(req.params.id);
    res.status(200).json(course);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Course not found' });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await courseService.createCourse(req.body, req.user?.userId);
    res.status(201).json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create course' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.status(200).json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update course' });
  }
};

export const updateCourseStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = (req.body?.status as string) || '';
    const course = await courseService.updateCourseStatus(req.params.id, status);
    res.status(200).json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update course status' });
  }
};
