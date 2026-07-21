import { type Request, type Response } from "express";
export declare const getAllenrolledCourses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCourseForLearning: (req: Request<{
    slug: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAsCompleted: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=learn.d.ts.map