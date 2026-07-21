import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import { Prisma } from "../prisma/client.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found"));
        }

        let user = await Prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          const avatar = profile.photos?.[0]?.value;
          user = await Prisma.user.create({
            data: {
              email,
              password: await bcrypt.hash(randomUUID(), 10),
              googleId: profile.id,
              firstName: profile.name?.givenName ?? "",
              lastName: profile.name?.familyName ?? "",
              ...(avatar ? { avatar } : {}),
              provider: "GOOGLE",
            },
          });
        }
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    },
  ),
);
