import { Request, Response } from 'express';
import discussService from '../services/discussService';
import moderationService from '../services/moderationService';
import { ReportReason } from '../models/DiscussionReport';

const VALID_REASONS: ReportReason[] = ['spam', 'harassment', 'misinformation', 'nsfw', 'other'];

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, skip, limit } = req.query;
    const result = await discussService.getPosts({
      category: typeof category === 'string' ? category : undefined,
      skip: skip ? parseInt(skip as string, 10) : 0,
      limit: limit ? Math.min(parseInt(limit as string, 10), 50) : 20,
      userId: req.user?.userId,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch posts' });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await discussService.getPost(id, req.user?.userId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    // Fire-and-forget view increment
    discussService.incrementViews(id).catch(() => {});
    res.status(200).json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch post' });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, type, tags, linkedProblemId, company, pollOptions } =
      req.body;

    if (!title?.trim() || !description?.trim() || !category?.trim()) {
      res.status(400).json({ error: 'title, description, and category are required' });
      return;
    }

    const post = await discussService.createPost(req.user!.userId, {
      title: String(title).trim().slice(0, 300),
      description: String(description).trim().slice(0, 5000),
      category: String(category).trim(),
      type: typeof type === 'string' ? type : undefined,
      tags: Array.isArray(tags) ? tags.map(String).slice(0, 10) : [],
      linkedProblemId: typeof linkedProblemId === 'string' ? linkedProblemId : undefined,
      company: typeof company === 'string' ? company.trim() : undefined,
      pollOptions: Array.isArray(pollOptions)
        ? pollOptions.map(String).filter(Boolean).slice(0, 6)
        : [],
    });

    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
};

export const upvotePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await discussService.toggleUpvote(req.params.id, req.user!.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle upvote' });
  }
};

export const votePoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { optionIndex } = req.body;
    if (typeof optionIndex !== 'number' || !Number.isInteger(optionIndex) || optionIndex < 0) {
      res.status(400).json({ error: 'optionIndex must be a non-negative integer' });
      return;
    }
    const result = await discussService.votePoll(req.params.id, optionIndex);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to vote on poll' });
  }
};

export const getTrendingTopics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const topics = await discussService.getTrendingTopics();
    res.status(200).json({ topics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch trending topics' });
  }
};

export const reportPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    if (!reason || !VALID_REASONS.includes(reason)) {
      res.status(400).json({
        error: `reason must be one of: ${VALID_REASONS.join(', ')}`,
      });
      return;
    }

    await moderationService.submitReport({
      discussionId: id,
      reporterId: req.user!.userId,
      reason: reason as ReportReason,
      details: typeof details === 'string' ? details.trim().slice(0, 1000) : undefined,
    });

    res.status(200).json({ message: 'Report submitted successfully' });
  } catch (error: any) {
    if (error.message === 'Discussion not found') {
      res.status(404).json({ error: 'Discussion not found' });
      return;
    }
    if (error.message === 'You have already reported this post') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message || 'Failed to submit report' });
  }
};
