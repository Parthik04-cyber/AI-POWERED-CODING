import Problem, { IProblem } from '../models/Problem';

class ProblemService {
  async getAllProblems(skip: number = 0, limit: number = 10, difficulty?: string, category?: string) {
    const query: any = {};

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const problems = await Problem.find(query).skip(skip).limit(limit);
    const total = await Problem.countDocuments(query);

    return { problems, total, skip, limit };
  }

  async getProblemById(problemId: string) {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
  }

  async createProblem(problemData: Partial<IProblem>) {
    const problem = new Problem(problemData);
    await problem.save();
    return problem;
  }

  async updateProblem(problemId: string, updateData: Partial<IProblem>) {
    const problem = await Problem.findByIdAndUpdate(problemId, updateData, { new: true });
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
  }

  async deleteProblem(problemId: string) {
    const problem = await Problem.findByIdAndDelete(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
  }

  async incrementSubmissionCount(problemId: string, accepted: boolean = false) {
    const updateData: any = { $inc: { submissionCount: 1 } };
    if (accepted) {
      updateData.$inc.acceptedCount = 1;
    }
    await Problem.findByIdAndUpdate(problemId, updateData);
  }

  async getCategories() {
    const categories = await Problem.distinct('category');
    return categories;
  }

  async getProblemStats() {
    const stats = await Problem.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          totalSubmissions: { $sum: '$submissionCount' },
          totalAccepted: { $sum: '$acceptedCount' },
        },
      },
    ]);
    return stats;
  }
}

export default new ProblemService();
