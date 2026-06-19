import { Router } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { encounterTransitions, encounters, patients } from "../db/schema/app.js";

const router = Router();

const normalizeQuery = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

router.get("/patients", async (req, res, next) => {
  try {
    const search = normalizeQuery(req.query.search);

    const where = search
      ? or(
          ilike(patients.hospitalNumber, `%${search}%`),
          ilike(patients.firstName, `%${search}%`),
          ilike(patients.lastName, `%${search}%`),
          ilike(patients.phone, `%${search}%`),
        )
      : undefined;

    const rows = await db
      .select()
      .from(patients)
      .where(where)
      .orderBy(desc(patients.createdAt))
      .limit(100);

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.post("/patients", async (req, res, next) => {
  try {
    const body = req.body as {
      id?: string;
      hospitalNumber?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      gender?: "male" | "female" | "other";
      dateOfBirth?: string;
    };

    if (!body.id || !body.hospitalNumber || !body.firstName || !body.lastName) {
      res.status(400).json({
        error: "id, hospitalNumber, firstName and lastName are required",
      });
      return;
    }

    const [created] = await db
      .insert(patients)
      .values({
        id: body.id,
        hospitalNumber: body.hospitalNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth,
        status: "active",
      })
      .returning();

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

router.get("/encounters", async (req, res, next) => {
  try {
    const patientId = normalizeQuery(req.query.patientId);

    const rows = await db
      .select()
      .from(encounters)
      .where(patientId ? eq(encounters.patientId, patientId) : undefined)
      .orderBy(desc(encounters.openedAt))
      .limit(100);

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.post("/encounters", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body as {
      id?: string;
      encounterNumber?: string;
      patientId?: string;
      encounterType?: "opd" | "emergency" | "inpatient" | "follow_up";
      triagePriority?: string;
    };

    if (!body.id || !body.encounterNumber || !body.patientId) {
      res
        .status(400)
        .json({ error: "id, encounterNumber and patientId are required" });
      return;
    }

    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(and(eq(patients.id, body.patientId), eq(patients.status, "active")))
      .limit(1);

    if (!patient) {
      res.status(404).json({ error: "Patient not found or inactive" });
      return;
    }

    const created = await db.transaction(async (tx) => {
      const [encounter] = await tx
        .insert(encounters)
        .values({
          id: body.id,
          encounterNumber: body.encounterNumber,
          patientId: body.patientId,
          encounterType: body.encounterType ?? "opd",
          status: "open",
          currentStage: "registry",
          registryUserId: req.user.id,
          insuranceVerified: false,
          triagePriority: body.triagePriority,
        })
        .returning();

      await tx.insert(encounterTransitions).values({
        id: `trans_${encounter.id}_registry`,
        encounterId: encounter.id,
        fromStage: null,
        toStage: "registry",
        changedByUserId: req.user.id,
        notes: "Encounter created",
      });

      return encounter;
    });

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

export default router;
