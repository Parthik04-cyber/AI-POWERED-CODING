import { Request, Response } from 'express';
import submissionService from '../services/submissionService';

export const submitCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      res.status(400).json({ error: 'Problem ID, code, and language are required' });
      return;
    }

    const submission = await submissionService.submitCode(req.user.userId, problemId, code, language);
    res.status(201).json(submission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const submission = await submissionService.getSubmissionById(id);
    res.status(200).json(submission);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await submissionService.getUserSubmissions(req.user.userId, skip, limit);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProblemSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId } = req.params;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await submissionService.getProblemSubmissions(problemId, skip, limit);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await submissionService.getLeaderboard(limit);
    res.status(200).json({ leaderboard });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const executeCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      res.status(400).json({ error: 'Code and language are required' });
      return;
    }

    const result = await submissionService.executeCode(code, language, input || '');
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to execute code' });
  }
};

export const getAllSubmissionsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await submissionService.getAllSubmissions(skip, limit);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
