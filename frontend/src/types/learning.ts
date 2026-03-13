// Learning Module Types
export interface LearningPack {
  id: string;
  title: string;
  description: string;
  chapters: number;
  problemsCount: number;
  progress: number; // 0-100
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  color: string;
  estimatedTime: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  modules: number;
  progress: number; // 0-100
  estimatedDuration: string;
  skills: string[];
}

export interface CompanyPack {
  id: string;
  company: string;
  logo: string;
  topicsCount: number;
  problemsCount: number;
  difficulty: string;
  lastUpdated: string;
  progress: number;
}

export interface MiniTest {
  id: string;
  title: string;
  topic: string;
  questionsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in minutes
  averageScore: number;
}

export interface Recommendation {
  id: string;
  type: 'topic' | 'problem' | 'learning_path';
  title: string;
  reason: string;
  difficulty: string;
  estimatedTime: string;
}

export interface AIAssistant {
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  specialization: string;
}
