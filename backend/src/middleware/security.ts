import type { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet.js";
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";

const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "test") return next();

  try {
    const role: RateLimitRole = req.user?.role || "guest";

    const roleRateLimits: Record<RateLimitRole, { limit: number; label: string }> = {
      admin: { limit: 1000, label: "Admin" },
      doctor: { limit: 600, label: "Doctor" },
      nurse: { limit: 600, label: "Nurse" },
      registry: { limit: 450, label: "Registry" },
      lab_technician: { limit: 450, label: "Lab technician" },
      pharmacist: { limit: 400, label: "Pharmacist" },
      ward_manager: { limit: 350, label: "Ward manager" },
      accounts: { limit: 300, label: "Accounts" },
      guest: { limit: 20, label: "Guest" },
    };

    const selectedRate = roleRateLimits[role] ?? roleRateLimits.guest;
    const limit = selectedRate.limit;
    const message = `${selectedRate.label} request limit exceeded (${limit} per minute). Please wait before making another request.`;

    if (!aj) {
      // Arcjet key not configured — skip rate-limiting in non-production environments
      return next();
    }

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limit,
      }),
    );

    const arcjetRequest: ArcjetNodeRequest = {
      headers: req.headers,
      method: req.method,
      url: req.originalUrl ?? req.url,
      socket: {
        remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0",
      },
    };

    const decision = await client.protect(arcjetRequest);

    if (decision?.isDenied()) {
      if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Automated requests are not allowed",
        });
      }
      if (decision.reason.isShield()) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Request blocked by security policy.",
        });
      }
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ error: "Too many requests", message });
      }

      return res.status(403).json({
        error: "Forbidden",
        message: "Request denied by security policy.",
      });
    }

    next();
  } catch (e) {
    console.error("Arcjet Middleware error: ", e);
    next(e);
  }
};

export default securityMiddleware;
