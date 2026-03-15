import { Request, Response } from 'express';
export declare const getPublishedCourses: (_req: Request, res: Response) => Promise<void>;
export declare const getPublishedCourseById: (req: Request, res: Response) => Promise<void>;
export declare const getAdminCourses: (req: Request, res: Response) => Promise<void>;
export declare const getAdminCourseById: (req: Request, res: Response) => Promise<void>;
export declare const createCourse: (req: Request, res: Response) => Promise<void>;
export declare const updateCourse: (req: Request, res: Response) => Promise<void>;
export declare const updateCourseStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=courseController.d.ts.map