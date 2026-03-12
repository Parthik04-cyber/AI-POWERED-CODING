import { Request, Response } from 'express';
import problemService from '../services/problemService';

export const getAllProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const difficulty = req.query.difficulty as string;
    const category = req.query.category as string;

    const result = await problemService.getAllProblems(skip, limit, difficulty, category);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProblemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const problem = await problemService.getProblemById(id);
    res.status(200).json(problem);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await problemService.createProblem(req.body);
    res.status(201).json(problem);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const problem = await problemService.updateProblem(id, req.body);
    res.status(200).json(problem);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await problemService.deleteProblem(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await problemService.getCategories();
    res.status(200).json({ categories });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProblemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await problemService.getProblemStats();
    res.status(200).json({ stats });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
