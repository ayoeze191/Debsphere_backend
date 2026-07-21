import type { JwtPayload } from "jsonwebtoken";
import type { User as PrismaUser } from "../generated/prisma/client.js";

interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface User extends PrismaUser {}

    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}
