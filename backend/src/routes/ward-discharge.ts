import { Router } from "express";
import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { admissions, encounterTransitions, encounters, wardBeds } from "../db/schema/app.js";

const router = Router();

router.post("/:encounterId/admit", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body as {
      id?: string;
      patientId?: string;
      wardId?: string;
      wardBedId?: string;
      admissionDiagnosis?: string;
      admittingConsultationId?: string;
    };

    if (!body.id || !body.patientId || !body.wardId || !body.wardBedId) {
      res.status(400).json({
        error: "id, patientId, wardId and wardBedId are required",
      });
      return;
    }

    const [bed] = await db
      .select()
      .from(wardBeds)
      .where(and(eq(wardBeds.id, body.wardBedId), eq(wardBeds.status, "available")))
      .limit(1);

    if (!bed) {
      res.status(400).json({ error: "Selected bed is not available" });
      return;
    }

    const [admission] = await db
      .insert(admissions)
      .values({
        id: body.id,
        encounterId: req.params.encounterId,
        patientId: body.patientId,
        admittingConsultationId: body.admittingConsultationId,
        admittedByUserId: req.user.id,
        wardId: body.wardId,
        wardBedId: body.wardBedId,
        admissionDiagnosis: body.admissionDiagnosis,
        status: "active",
      })
      .returning();

    await db
      .update(wardBeds)
      .set({ status: "occupied", updatedAt: new Date() })
      .where(eq(wardBeds.id, body.wardBedId));

    await db
      .update(encounters)
      .set({ currentStage: "ward", updatedAt: new Date() })
      .where(eq(encounters.id, req.params.encounterId));

    await db.insert(encounterTransitions).values({
      id: `trans_${req.params.encounterId}_${Date.now()}`,
      encounterId: req.params.encounterId,
      fromStage: "consultation",
      toStage: "ward",
      changedByUserId: req.user.id,
      notes: "Patient admitted",
    });

    res.status(201).json({ data: admission });
  } catch (error) {
    next(error);
  }
});

router.post("/admissions/:admissionId/discharge", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body as {
      dischargeSummary?: string;
      closeEncounter?: boolean;
      closeReason?: string;
    };

    const [admission] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, req.params.admissionId))
      .limit(1);

    if (!admission) {
      res.status(404).json({ error: "Admission not found" });
      return;
    }

    const [updatedAdmission] = await db
      .update(admissions)
      .set({
        status: "discharged",
        dischargedAt: new Date(),
        dischargeSummary: body.dischargeSummary,
        updatedAt: new Date(),
      })
      .where(eq(admissions.id, admission.id))
      .returning();

    if (admission.wardBedId) {
      await db
        .update(wardBeds)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(wardBeds.id, admission.wardBedId));
    }

    if (body.closeEncounter ?? true) {
      const [encounter] = await db
        .select()
        .from(encounters)
        .where(eq(encounters.id, admission.encounterId))
        .limit(1);

      if (encounter) {
        await db
          .update(encounters)
          .set({
            status: "closed",
            currentStage: "closed",
            closedAt: new Date(),
            closeReason: body.closeReason ?? "Discharged from ward",
            updatedAt: new Date(),
          })
          .where(eq(encounters.id, encounter.id));

        await db.insert(encounterTransitions).values({
          id: `trans_${encounter.id}_${Date.now()}`,
          encounterId: encounter.id,
          fromStage: encounter.currentStage,
          toStage: "closed",
          changedByUserId: req.user.id,
          notes: "Discharged and encounter closed",
        });
      }
    }

    res.json({ data: updatedAdmission });
  } catch (error) {
    next(error);
  }
});

router.post("/:encounterId/close-opd", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { encounterId } = req.params;
    const body = req.body as { closeReason?: string };

    const [encounter] = await db
      .select()
      .from(encounters)
      .where(eq(encounters.id, encounterId))
      .limit(1);

    if (!encounter) {
      res.status(404).json({ error: "Encounter not found" });
      return;
    }

    const [closed] = await db
      .update(encounters)
      .set({
        status: "closed",
        currentStage: "closed",
        closedAt: new Date(),
        closeReason: body.closeReason ?? "Medication dispensed",
        updatedAt: new Date(),
      })
      .where(eq(encounters.id, encounterId))
      .returning();

    await db.insert(encounterTransitions).values({
      id: `trans_${encounterId}_${Date.now()}`,
      encounterId,
      fromStage: encounter.currentStage,
      toStage: "closed",
      changedByUserId: req.user.id,
      notes: "OPD encounter closed",
    });

    res.json({ data: closed });
  } catch (error) {
    next(error);
  }
});

export default router;
