import type { User } from "../generated/prisma/client.js";
import type { Request, Response } from "express";
export declare const signToken: (user: User) => string;
export declare const RegisterUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const LoginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.d.ts.map