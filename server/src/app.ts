import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env, getAllowedOrigins } from "./config/env";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const allowed = getAllowedOrigins();
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      
      // Ultra-permissive fallback for Vercel deployments and Localhost
      if (origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
