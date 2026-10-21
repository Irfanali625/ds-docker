import "./config/env";
import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import phoneValidationRoutes from "./routes/phoneValidationRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import { connectDB } from "./database/db";
import cron from "node-cron";
import {
  runB2BCleaningJob,
  runB2CCleaningJob,
} from "./services/dataCleaningService";

const app = express();
const PORT = process.env.PORT || 8000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost";
const RAW_BODY_PATHS = ["/webhooks/stripe", "/webhooks/square"];

// Behind nginx: lets req.protocol report https, which the Square signature check relies on.
app.set("trust proxy", 1);
app.use(cors());

// Webhooks need the untouched body for signature verification.
app.use(RAW_BODY_PATHS, express.raw({ type: "application/json" }));

const jsonParser = express.json({ limit: "10mb" });
const urlencodedParser = express.urlencoded({ extended: true, limit: "10mb" });

app.use((req, res, next) => {
  if (RAW_BODY_PATHS.some((p) => req.originalUrl.startsWith(p))) return next();
  jsonParser(req, res, (err) => (err ? next(err) : urlencodedParser(req, res, next)));
});

app.use("/api/auth", authRoutes);
app.use("/api/phone-validation", phoneValidationRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/webhooks", webhookRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "CSV files can be at most 10 MB" : err.message;
    return res.status(400).json({ error: message });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request is too large" });
  }
  if (err?.message === "Only CSV files are allowed") {
    return res.status(400).json({ error: err.message });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on ${BACKEND_URL}:${PORT}`);
      console.log(`Health check: ${BACKEND_URL}:${PORT}/health`);
    });
  } catch (error: any) {
    console.error("Failed to start server:", error);
    if (error.message?.includes("Authentication")) {
      console.error(
        "\nPlease fix your MongoDB credentials in the .env file and try again."
      );
    }
    process.exit(1);
  }
}

// B2B
cron.schedule("0 */6 * * *", async () => {
  await runB2BCleaningJob();
});

// B2C (3-hour offset)
cron.schedule("0 3-23/6 * * *", async () => {
  await runB2CCleaningJob();
});

startServer();
