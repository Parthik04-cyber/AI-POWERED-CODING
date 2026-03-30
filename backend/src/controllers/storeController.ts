import { Request, Response } from 'express';
import storeService from '../services/storeService';

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const overview = await storeService.getStoreOverview(req.user.userId);
    res.status(200).json(overview);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPurchaseHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string, 10) || 30;
    const history = await storeService.getPurchaseHistory(req.user.userId, limit);
    res.status(200).json({ history });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const redeemItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { itemId } = req.body;
    if (!itemId) {
      res.status(400).json({ error: 'itemId is required' });
      return;
    }

    const result = await storeService.redeemItem(req.user.userId, itemId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const subscribePremium = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await storeService.subscribePremium(req.user.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const claimDailyLoginReward = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await storeService.claimDailyLoginReward(req.user.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const spinLuckyWheel = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await storeService.spinLuckyWheel(req.user.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rewardActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { activityType, referenceId } = req.body;
    if (!activityType || !referenceId) {
      res.status(400).json({ error: 'activityType and referenceId are required' });
      return;
    }

    if (!['contest', 'interview'].includes(activityType)) {
      res.status(400).json({ error: 'activityType must be contest or interview' });
      return;
    }

    const result = await storeService.rewardActivity(req.user.userId, activityType, referenceId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCoinLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const leaderboard = await storeService.getCoinLeaderboard(limit);
    res.status(200).json({ leaderboard });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievements = await storeService.getAchievements(req.user.userId);
    res.status(200).json({ achievements });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAdminOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const overview = await storeService.getAdminOverview(limit);
    res.status(200).json(overview);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, cost, section } = req.body;
    const item = await storeService.createCatalogItem({ title, description, cost, section });
    res.status(201).json({ message: 'Catalog item created', item });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, cost, section, isActive } = req.body;
    const item = await storeService.updateCatalogItem(id, { title, description, cost, section, isActive });
    res.status(200).json({ message: 'Catalog item updated', item });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await storeService.removeCatalogItem(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
