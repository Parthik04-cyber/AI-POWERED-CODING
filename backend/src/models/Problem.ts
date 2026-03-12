import mongoose, { Schema, Document } from 'mongoose';

export interface IExample {
  input: string;
  output: string;
}

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  examples: IExample[];
  constraints: string[];
  testCases: IExample[];
  timeLimit: number;
  memoryLimit: number;
  submissionCount: number;
  acceptedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const exampleSchema = new Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    examples: [exampleSchema],
    constraints: [String],
    testCases: [exampleSchema],
    timeLimit: {
      type: Number,
      default: 5,
    },
    memoryLimit: {
      type: Number,
      default: 256,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
    acceptedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProblem>('Problem', problemSchema);
