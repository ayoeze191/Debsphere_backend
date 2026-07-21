import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import route from "./routes/index.js";
import "./config/passport.js";

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGIN ?? "http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Requests made outside a browser (for example health checks) have no Origin.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  }),
);
app.use(express.json());
app.use(passport.initialize());

app.use("/api", route);

export default app;
