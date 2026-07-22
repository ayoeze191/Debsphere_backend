import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma as PrismaClient } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} was not found`, 404));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    });
  }

  if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A record with that value already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "The requested record was not found" });
    }
    if (error.code === "P2003") {
      return res.status(409).json({
        error: "This record cannot be changed because it is still in use",
      });
    }
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON request body" });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ error: "Internal server error" });
};
