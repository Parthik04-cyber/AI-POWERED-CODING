import { Request, Response } from 'express';
import contestService from '../services/contestService';

export const getPublicContests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const payload = await contestService.getPublicContests();
    res.status(200).json(payload);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load contests' });
  }
};

export const getAdminContestOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const overview = await contestService.getAdminOverview();
    res.status(200).json(overview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load contests' });
  }
};
