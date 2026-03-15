export type CourseStatus = 'Draft' | 'Review' | 'Published';

export interface ICourseLesson {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  order: number;
}

export interface ICourse {
  _id: string;
  title: string;
  description?: string;
  track?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
  status: CourseStatus;
  lessons: ICourseLesson[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
