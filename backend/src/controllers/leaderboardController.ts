import { Request, Response } from 'express';
import submissionService from '../services/submissionService';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await submissionService.getLeaderboard(limit);
    res.status(200).json({ leaderboard });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};