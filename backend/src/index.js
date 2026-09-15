import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import inventoryRoutes from "./routes/inventory.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import ordersRoutes from "./routes/orders.js";
import reviewsRoutes from "./routes/reviews.js";
import knowledgeBaseRoutes from "./routes/knowledgeBase.js";
import supportRoutes from "./routes/support.js";
import paymentsRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import analyticsRoutes from "./routes/analytics.js";
import { validateEnv } from "./config/env.js";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

dotenv.config();
validateEnv();

const app = express();

app.set("trust proxy", 1);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const allowedOrigins = [
  CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5176",
  "http://localhost:3001",
  "https://aneeqak30023-commits.github.io",
];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }));

app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.removeHeader("X-Powered-By");
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again later.",
  },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI service rate limit exceeded. Please try again later." },
});

app.use("/api/auth", authLimiter);
app.use("/api/ai", aiLimiter);
app.use(generalLimiter);

app.use("/health", healthRoutes);
app.use("/api/products", generalLimiter, productsRoutes);
app.use("/api/categories", generalLimiter, categoriesRoutes);
app.use("/api/inventory", generalLimiter, inventoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", generalLimiter, cartRoutes);
app.use("/api/wishlist", generalLimiter, wishlistRoutes);
app.use("/api/orders", generalLimiter, ordersRoutes);
app.use("/api/reviews", generalLimiter, reviewsRoutes);
app.use("/api/knowledge-base", generalLimiter, knowledgeBaseRoutes);
app.use("/api/support", generalLimiter, supportRoutes);
app.use("/api/payments", generalLimiter, paymentsRoutes);
app.use("/api/admin", generalLimiter, adminRoutes);
app.use("/api/admin/analytics", generalLimiter, analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ error: "Internal server error" });
});

export function start(port) {
  const server = app.listen(port, () => {
    console.log(
      `NexMart backend running on port ${port} (${process.env.NODE_ENV || "development"})`,
    );
  });
  return server;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  const port = Number(process.env.PORT || 3001);
  start(port);
}

export { app };
