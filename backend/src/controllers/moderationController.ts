import { Request, Response } from 'express';
import moderationService from '../services/moderationService';
import { ModerationAction, ModerationStatus } from '../models/DiscussionReport';

const VALID_ACTIONS: ModerationAction[] = [
  'approve',
  'delete_post',
  'warn_user',
  'escalate',
  'dismiss',
];

export const getModerationStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await moderationService.getModerationStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch moderation stats' });
  }
};

export const getModerationQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skip, limit, status } = req.query;
    const result = await moderationService.getModerationQueue({
      skip: skip ? parseInt(skip as string, 10) : 0,
      limit: limit ? Math.min(parseInt(limit as string, 10), 100) : 50,
      status: typeof status === 'string' ? (status as ModerationStatus) : undefined,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch moderation queue' });
  }
};

export const takeAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId, discussionId, action, notes } = req.body;

    if (!reportId || typeof reportId !== 'string') {
      res.status(400).json({ error: 'reportId is required' });
      return;
    }
    if (!discussionId || typeof discussionId !== 'string') {
      res.status(400).json({ error: 'discussionId is required' });
      return;
    }
    if (!action || !VALID_ACTIONS.includes(action)) {
      res.status(400).json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}` });
      return;
    }

    await moderationService.takeAction({
      reportId,
      discussionId,
      adminId: req.user!.userId,
      action: action as ModerationAction,
      notes: typeof notes === 'string' ? notes.trim().slice(0, 500) : undefined,
    });

    res.status(200).json({ message: `Action '${action}' taken successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to take moderation action' });
  }
};

export const getActionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const history = await moderationService.getActionHistory(reportId);
    res.status(200).json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch action history' });
  }
};
