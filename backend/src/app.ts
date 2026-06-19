import express from "express";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import securityMiddleware from "./middleware/security.js";
import requireAuth from "./middleware/requireAuth.js";
import { auth } from "./lib/auth.js";
import userRoutes from "./routes/users.js";
import patientsEncountersRoutes from "./routes/patients-encounters.js";
import insuranceVerificationRoutes from "./routes/insurance-verification.js";
import vitalsConsultationRoutes from "./routes/vitals-consultation.js";
import labPharmacyRoutes from "./routes/lab-pharmacy.js";
import wardDischargeRoutes from "./routes/ward-discharge.js";

const app = express();

const normalizeOrigin = (value: string) => {
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
  if (!trimmed) return "";

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed;
  }
};

const configuredFrontendUrls = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter((origin) => Boolean(origin));
const isProduction = process.env.NODE_ENV === "production";

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
  "http://localhost:4174",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:4174",
];

const allowedOrigins = new Set<string>([
  ...(isProduction ? [] : defaultDevOrigins),
  ...configuredFrontendUrls,
]);

allowedOrigins.forEach((origin) => {
  const normalized = normalizeOrigin(origin);
  if (normalized !== origin) {
    allowedOrigins.delete(origin);
    allowedOrigins.add(normalized);
  }
});

app.use(
  cors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedRequestOrigin = normalizeOrigin(origin);

      if (allowedOrigins.has(normalizedRequestOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${normalizedRequestOrigin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", requireAuth);
app.use("/api", securityMiddleware);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/patients-encounters", patientsEncountersRoutes);
app.use("/api/insurance-verification", insuranceVerificationRoutes);
app.use("/api/vitals-consultation", vitalsConsultationRoutes);
app.use("/api/lab-pharmacy", labPharmacyRoutes);
app.use("/api/ward-discharge", wardDischargeRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("Hospital Management Backend server is running!");
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled API error:", error);
  res.status(500).json({ error: "Internal server error" });
});

export default app;