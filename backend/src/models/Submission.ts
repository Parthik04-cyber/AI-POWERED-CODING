import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  code: string;
  language: string;
  status: 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'WRONG_ANSWER' | 'PENDING';
  executionTime: number;
  memory: number;
  output: string;
  error?: string;
  testsPassed: number;
  totalTests: number;
  aiFeedback?: {
    complexity: string;
    suggestions: string[];
    optimization: string;
    score: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: ['javascript', 'python', 'java', 'cpp'],
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'WRONG_ANSWER', 'PENDING'],
      default: 'PENDING',
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    output: {
      type: String,
      default: '',
    },
    error: String,
    testsPassed: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    aiFeedback: {
      complexity: String,
      suggestions: [String],
      optimization: String,
      score: Number,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ createdAt: -1 });

export default mongoose.model<ISubmission>('Submission', submissionSchema);
