import { Prisma } from "../prisma/client.js";
import { UserRole, type User } from "../generated/prisma/client.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import emailservice from "../services/emailservice.js";
import { emailQueue } from "../queue/email.queue.js";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

const withoutPassword = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const signToken = (user: User) => {
  console.log(user.id);

  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

export const RegisterUser = async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role = UserRole.STUDENT,
  } = req.body;
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

  if (!Object.values(UserRole).includes(role)) {
    return res.status(400).json({ error: "Invalid user role" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const User = await Prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: passwordHash,
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        role,
      },
    });
    const token = crypto.randomBytes(32).toString("hex");
    await Prisma.verificationToken.create({
      data: {
        token,
        userId: User.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });
    emailQueue.add("send-verification-email", {
      email: User.email,
      firstName: User.firstName,
      token,
    });
    // await emailservice.sendVerificationEmail(User.email, User.firstName, token);
    res.status(201).json({
      // user: withoutPassword(User),
      message: "User Successfully, Please Check your mail for verification",
    });
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

  if (!user!.isVerfied) {
    return res.status(403).json({
      error: "Please verify your email before logging in.",
    });
  }
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

  return res.json({ user: withoutPassword(user), token: signToken(user) });
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
      id: req.auth!.userId,
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
    user: withoutPassword(user),
  });
};

export const verifyUserAccount = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    return res.status(400).json({
      error: "Verification token is required",
    });
  }

  const verification = await Prisma.verificationToken.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });

  if (!verification) {
    return res.status(400).json({
      error: "Invalid verification token",
    });
  }

  if (verification.user.isVerfied) {
    return res.status(400).json({
      error: "Account is already verified",
    });
  }

  if (verification.expiresAt < new Date()) {
    return res.status(400).json({
      error: "Verification token has expired",
    });
  }

  const [updatedUser] = await Prisma.$transaction([
    Prisma.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        isVerfied: true,
      },
    }),
    Prisma.verificationToken.delete({
      where: {
        id: verification.id,
      },
    }),
  ]);

  return res.json({
    user: withoutPassword(updatedUser),
    token: signToken(updatedUser),
  });
};
