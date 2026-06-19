import { Router } from "express";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  encounterTransitions,
  encounters,
  insuranceVerifications,
  patientInsurances,
} from "../db/schema/app.js";

const router = Router();

router.post("/:encounterId/verify", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { encounterId } = req.params;
    const body = req.body as { patientInsuranceId?: string; status?: "active" | "inactive" | "pending" | "expired" | "rejected" };

    if (!body.patientInsuranceId || !body.status) {
      res.status(400).json({ error: "patientInsuranceId and status are required" });
      return;
    }

    const [encounter] = await db
      .select()
      .from(encounters)
      .where(eq(encounters.id, encounterId))
      .limit(1);

    if (!encounter) {
      res.status(404).json({ error: "Encounter not found" });
      return;
    }

    const [insurance] = await db
      .select()
      .from(patientInsurances)
      .where(eq(patientInsurances.id, body.patientInsuranceId))
      .limit(1);

    if (!insurance || insurance.patientId !== encounter.patientId) {
      res.status(400).json({ error: "Insurance policy does not belong to encounter patient" });
      return;
    }

    const [verification] = await db
      .insert(insuranceVerifications)
      .values({
        id: `insv_${Date.now()}`,
        encounterId,
        patientInsuranceId: body.patientInsuranceId,
        verifiedByUserId: req.user.id,
        status: body.status,
        responseCode: body.status === "active" ? "00" : "10",
        responseMessage: body.status === "active" ? "Eligible" : "Not eligible",
        payload: { source: "manual" },
      })
      .returning();

    const nextStage = body.status === "active" ? "vitals" : encounter.currentStage;

    const [updated] = await db
      .update(encounters)
      .set({
        insuranceVerified: body.status === "active",
        currentStage: nextStage,
        updatedAt: new Date(),
      })
      .where(eq(encounters.id, encounterId))
      .returning();

    if (encounter.currentStage !== nextStage) {
      await db.insert(encounterTransitions).values({
        id: `trans_${encounterId}_${Date.now()}`,
        encounterId,
        fromStage: encounter.currentStage,
        toStage: nextStage,
        changedByUserId: req.user.id,
        notes: "Insurance verified",
      });
    }

    res.status(201).json({ data: { verification, encounter: updated } });
  } catch (error) {
    next(error);
  }
});

router.get("/:encounterId", async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(insuranceVerifications)
      .where(eq(insuranceVerifications.encounterId, req.params.encounterId));

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

export default router;
