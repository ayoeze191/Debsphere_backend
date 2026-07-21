import { Prisma } from "../prisma/client.js";
import type { User } from "../generated/prisma/client.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

export const signToken = (user: User) => {
  console.log(user.id);

  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

export const RegisterUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required " });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const User = await Prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: passwordHash,
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      },
    });
    res.status(201).json({ user: User, message: "User Successfully" });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
};

export const LoginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = await Prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (user?.provider == "GOOGLE") {
    return res.status(302).json({
      message: "This account uses Google Sign-In. Please continue with Google.",
    });
  }
  if (!user) {
    return res
      .status(404)
      .json({ error: "User does not Exist,Please create an account" });
  }
  const passwordValid = await bcrypt.compare(password, user?.password);
  if (!user || !passwordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({ user, token: signToken(user) });
};

// export const googleAuthController = async (req: Request, res: Response) => {
//   const user = req.user;

//   if (!user) {
//     return res.status(401).json({ error: "Google authentication failed" });
//   }

//   const accessToken = signToken(user);

//   return res.redirect(
//     `http://localhost:3000/auth/success?token=${accessToken}`,
//   );
// };

export const getUser = async (req: Request, res: Response) => {
  const user = await Prisma.user.findUnique({
    where: {
      id: req.auth?.userId,
    },
  });
  console.log(user);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "Success",
    user,
  });
};
