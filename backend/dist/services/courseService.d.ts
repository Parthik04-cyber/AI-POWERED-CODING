import { ICourse } from '../models/Course';
declare class CourseService {
    getPublishedCourses(): Promise<ICourse[]>;
    getPublishedCourseById(courseId: string): Promise<ICourse>;
    getAdminCourses(status?: string): Promise<ICourse[]>;
    getAdminCourseById(courseId: string): Promise<ICourse>;
    createCourse(payload: Partial<ICourse>, createdBy?: string): Promise<ICourse>;
    updateCourse(courseId: string, payload: Partial<ICourse>): Promise<ICourse>;
    updateCourseStatus(courseId: string, status: string): Promise<ICourse>;
}
declare const _default: CourseService;
export default _default;
//# sourceMappingURL=courseService.d.ts.map