export interface IExample {
  input: string;
  output: string;
}

export interface IProblem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
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
