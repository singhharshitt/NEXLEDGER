import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
