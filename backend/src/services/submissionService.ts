import axios from 'axios';
import Submission, { ISubmission } from '../models/Submission';
import Problem from '../models/Problem';
import User from '../models/User';
import problemService from './problemService';

interface Judge0Response {
  status: { id: number; description: string };
  compile_output?: string;
  runtime_error?: string;
  time?: number;
  memory?: number;
  stdout?: string;
}

class SubmissionService {
  private judge0BaseUrl = process.env.JUDGE0_API_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
  private judge0ApiKey = process.env.JUDGE0_API_KEY || '';

  async submitCode(
    userId: string,
    problemId: string,
    code: string,
    language: string
  ): Promise<ISubmission> {
    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    // Create submission record
    const submission = new Submission({
      userId,
      problemId,
      code,
      language,
      status: 'PENDING',
    });

    await submission.save();

    // Execute code with test cases (async, will update later)
    this.executeCodeAsync(submission._id.toString(), code, language, problem.testCases);

    return submission;
  }

  async executeCodeAsync(
    submissionId: string,
    code: string,
    language: string,
    testCases: any[]
  ): Promise<void> {
    try {
      const languageMap: Record<string, number> = {
        javascript: 63,
        python: 71,
        java: 62,
        cpp: 54,
      };

      const languageId = languageMap[language] || 71;
      let testsPassed = 0;
      let executionTime = 0;
      let memory = 0;
      let status = 'SUCCESS';
      let output = '';
      let error = '';

      for (const testCase of testCases) {
        try {
          const response = await axios.post(
            `${this.judge0BaseUrl}/submissions?wait=true`,
            {
              source_code: code,
              language_id: languageId,
              stdin: testCase.input,
              expected_output: testCase.output,
            },
            {
              headers: {
                'X-RapidAPI-Key': this.judge0ApiKey,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json',
              },
            }
          );

          const result: Judge0Response = response.data;

          if (result.status.id === 3) {
            // Accepted
            testsPassed++;
            output = result.stdout || '';
          } else if (result.status.id === 4) {
            status = 'WRONG_ANSWER';
            error = `Expected: ${testCase.output}, Got: ${result.stdout}`;
          } else if (result.status.id === 5) {
            status = 'TIME_LIMIT_EXCEEDED';
            error = result.runtime_error || 'Time limit exceeded';
          } else if (result.status.id === 6) {
            status = 'COMPILE_ERROR';
            error = result.compile_output || 'Compilation error';
            break;
          } else if (result.status.id === 7) {
            status = 'RUNTIME_ERROR';
            error = result.runtime_error || 'Runtime error';
          }

          if (result.time) executionTime += result.time;
          if (result.memory) memory = Math.max(memory, result.memory);
        } catch (err) {
          status = 'RUNTIME_ERROR';
          error = 'Failed to execute test case';
          break;
        }
      }

      // Update submission
      const submission = await Submission.findByIdAndUpdate(
        submissionId,
        {
          status,
          testsPassed,
          totalTests: testCases.length,
          executionTime,
          memory,
          output,
          error,
        },
        { new: true }
      );

      if (!submission) return;

      // Update problem and user stats
      if (submission.problemId) {
        await problemService.incrementSubmissionCount(submission.problemId.toString(), status === 'SUCCESS');
      }

      if (submission.userId && status === 'SUCCESS') {
        const user = await User.findById(submission.userId);
        if (user) {
          user.problemsSolved = (user.problemsSolved || 0) + 1;
          user.totalSubmissions = (user.totalSubmissions || 0) + 1;
          user.score = (user.score || 0) + 10;
          await user.save();
        }
      }

      // TODO: Call AI analysis service
    } catch (error) {
      console.error('Error executing code:', error);
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'RUNTIME_ERROR',
        error: 'Failed to execute code',
      });
    }
  }

  async getSubmissionById(submissionId: string) {
    const submission = await Submission.findById(submissionId)
      .populate('userId', 'username email')
      .populate('problemId', 'title difficulty');

    if (!submission) {
      throw new Error('Submission not found');
    }
    return submission;
  }

  async getUserSubmissions(userId: string, skip: number = 0, limit: number = 10) {
    const submissions = await Submission.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('problemId', 'title difficulty');

    const total = await Submission.countDocuments({ userId });
    return { submissions, total };
  }

  async getProblemSubmissions(problemId: string, skip: number = 0, limit: number = 10) {
    const submissions = await Submission.find({ problemId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username');

    const total = await Submission.countDocuments({ problemId });
    return { submissions, total };
  }

  async getLeaderboard(limit: number = 10) {
    const leaderboard = await User.find()
      .select('username score problemsSolved totalSubmissions')
      .sort({ score: -1 })
      .limit(limit);

    return leaderboard;
  }
}

export default new SubmissionService();
