import { NextFunction, Request, Response } from 'express';
import { getUserById } from '../utils/persistence';
import { getUserAccessState, TRIAL_EXPIRED_MESSAGE } from '../services/accessService';

export const subscriptionAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Please log in to continue.' });
      return;
    }

    const user = await getUserById(req.user.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found.' });
      return;
    }

    const accessState = getUserAccessState(user);
    if (!accessState.hasAccess) {
      res.status(403).json({
        error: TRIAL_EXPIRED_MESSAGE,
        accessStatus: accessState.status,
        trialEndsAt: accessState.trialEndsAt,
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
