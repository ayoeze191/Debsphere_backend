import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

export const verifyPaystackWebhook = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const signature = req.headers["x-paystack-signature"];
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(req.body)
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  next();
};
