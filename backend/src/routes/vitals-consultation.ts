import { Router } from "express";
import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  consultationDiagnoses,
  consultations,
  encounterTransitions,
  encounters,
  vitals,
} from "../db/schema/app.js";

const router = Router();

router.post("/:encounterId/vitals", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { encounterId } = req.params;
    const body = req.body as {
      id?: string;
      temperatureC?: string;
      systolicBp?: number;
      diastolicBp?: number;
      pulseRate?: number;
      respiratoryRate?: number;
      oxygenSaturation?: string;
      weightKg?: string;
      heightCm?: string;
      bmi?: string;
      painScore?: number;
      notes?: string;
    };

    if (!body.id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    const [encounter] = await db
      .select()
      .from(encounters)
      .where(and(eq(encounters.id, encounterId), eq(encounters.status, "open")))
      .limit(1);

    if (!encounter) {
      res.status(404).json({ error: "Open encounter not found" });
      return;
    }

    const [created] = await db
      .insert(vitals)
      .values({
        id: body.id,
        encounterId,
        recordedByUserId: req.user.id,
        temperatureC: body.temperatureC,
        systolicBp: body.systolicBp,
        diastolicBp: body.diastolicBp,
        pulseRate: body.pulseRate,
        respiratoryRate: body.respiratoryRate,
        oxygenSaturation: body.oxygenSaturation,
        weightKg: body.weightKg,
        heightCm: body.heightCm,
        bmi: body.bmi,
        painScore: body.painScore,
        notes: body.notes,
      })
      .returning();

    await db
      .update(encounters)
      .set({ currentStage: "consultation", updatedAt: new Date() })
      .where(eq(encounters.id, encounterId));

    await db.insert(encounterTransitions).values({
      id: `trans_${encounterId}_${Date.now()}`,
      encounterId,
      fromStage: encounter.currentStage,
      toStage: "consultation",
      changedByUserId: req.user.id,
      notes: "Vitals captured",
    });

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

router.post("/:encounterId/consultations", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { encounterId } = req.params;
    const body = req.body as {
      id?: string;
      chiefComplaint?: string;
      historyOfPresentingComplaint?: string;
      physicalExamination?: string;
      assessment?: string;
      plan?: string;
      outcome?: "completed" | "referred" | "admitted" | "follow_up";
      diagnoses?: Array<{
        id: string;
        diagnosisType: "primary" | "secondary" | "provisional" | "final";
        icd11Code?: string;
        icd11Title?: string;
        gDrgCode?: string;
        gDrgTitle?: string;
      }>;
    };

    if (!body.id) {
      res.status(400).json({ error: "id is required" });
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

    const [consultation] = await db
      .insert(consultations)
      .values({
        id: body.id,
        encounterId,
        clinicianUserId: req.user.id,
        chiefComplaint: body.chiefComplaint,
        historyOfPresentingComplaint: body.historyOfPresentingComplaint,
        physicalExamination: body.physicalExamination,
        assessment: body.assessment,
        plan: body.plan,
        outcome: body.outcome ?? "completed",
      })
      .returning();

    if (body.diagnoses?.length) {
      await db.insert(consultationDiagnoses).values(
        body.diagnoses.map((d) => ({
          id: d.id,
          consultationId: consultation.id,
          encounterId,
          diagnosisType: d.diagnosisType,
          icd11Code: d.icd11Code,
          icd11Title: d.icd11Title,
          gDrgCode: d.gDrgCode,
          gDrgTitle: d.gDrgTitle,
        })),
      );
    }

    res.status(201).json({ data: consultation });
  } catch (error) {
    next(error);
  }
});

export default router;
