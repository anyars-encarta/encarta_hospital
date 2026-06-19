import { Router } from "express";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  dispensations,
  encounterTransitions,
  encounters,
  laboratoryOrderItems,
  laboratoryOrders,
  laboratoryResults,
  prescriptionItems,
  prescriptions,
} from "../db/schema/app.js";

const router = Router();

router.post("/:encounterId/lab-orders", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body as {
      id?: string;
      consultationId?: string;
      priority?: string;
      clinicalNotes?: string;
      items?: Array<{ id: string; testId: string; instructions?: string }>;
    };

    if (!body.id || !body.items?.length) {
      res.status(400).json({ error: "id and at least one lab item are required" });
      return;
    }

    const [order] = await db
      .insert(laboratoryOrders)
      .values({
        id: body.id,
        encounterId: req.params.encounterId,
        consultationId: body.consultationId,
        orderedByUserId: req.user.id,
        status: "ordered",
        priority: body.priority,
        clinicalNotes: body.clinicalNotes,
      })
      .returning();

    await db.insert(laboratoryOrderItems).values(
      body.items.map((item): typeof laboratoryOrderItems.$inferInsert => ({
        id: item.id,
        laboratoryOrderId: order.id,
        testId: item.testId,
        instructions: item.instructions,
        status: "ordered",
      })),
    );

    await db
      .update(encounters)
      .set({ currentStage: "laboratory", updatedAt: new Date() })
      .where(eq(encounters.id, req.params.encounterId));

    await db.insert(encounterTransitions).values({
      id: `trans_${req.params.encounterId}_${Date.now()}`,
      encounterId: req.params.encounterId,
      fromStage: "consultation",
      toStage: "laboratory",
      changedByUserId: req.user.id,
      notes: "Lab order created",
    });

    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
});

router.post("/lab-results/:orderItemId", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body as {
      id?: string;
      parameterId?: string;
      valueText?: string;
      valueNumeric?: string;
      unit?: string;
      comments?: string;
    };

    if (!body.id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    const [created] = await db
      .insert(laboratoryResults)
      .values({
        id: body.id,
        orderItemId: req.params.orderItemId,
        parameterId: body.parameterId,
        valueText: body.valueText,
        valueNumeric: body.valueNumeric,
        unit: body.unit,
        comments: body.comments,
        enteredByUserId: req.user.id,
      })
      .returning();

    await db
      .update(laboratoryOrderItems)
      .set({ status: "completed", resultedAt: new Date(), verifiedByUserId: req.user.id })
      .where(eq(laboratoryOrderItems.id, req.params.orderItemId));

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

router.post("/:encounterId/prescriptions", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body as {
      id?: string;
      consultationId?: string;
      notes?: string;
      items?: Array<{
        id: string;
        medicineId: string;
        dose?: string;
        route?: "oral" | "iv" | "im" | "sc" | "topical" | "inhalation" | "other";
        frequency?: string;
        durationDays?: number;
        quantityPrescribed?: string;
        instructions?: string;
      }>;
    };

    if (!body.id || !body.items?.length) {
      res
        .status(400)
        .json({ error: "id and at least one prescription item are required" });
      return;
    }

    const [prescription] = await db
      .insert(prescriptions)
      .values({
        id: body.id,
        encounterId: req.params.encounterId,
        consultationId: body.consultationId,
        prescribedByUserId: req.user.id,
        notes: body.notes,
        status: "pending",
      })
      .returning();

    await db.insert(prescriptionItems).values(
      body.items.map((item): typeof prescriptionItems.$inferInsert => ({
        id: item.id,
        prescriptionId: prescription.id,
        medicineId: item.medicineId,
        dose: item.dose,
        route: item.route,
        frequency: item.frequency,
        durationDays: item.durationDays,
        quantityPrescribed: item.quantityPrescribed,
        instructions: item.instructions,
        dispenseStatus: "pending",
      })),
    );

    await db
      .update(encounters)
      .set({ currentStage: "pharmacy", updatedAt: new Date() })
      .where(eq(encounters.id, req.params.encounterId));

    await db.insert(encounterTransitions).values({
      id: `trans_${req.params.encounterId}_${Date.now()}`,
      encounterId: req.params.encounterId,
      fromStage: "consultation",
      toStage: "pharmacy",
      changedByUserId: req.user.id,
      notes: "Prescription raised",
    });

    res.status(201).json({ data: prescription });
  } catch (error) {
    next(error);
  }
});

router.post("/dispensations", async (req, res, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body as {
      id?: string;
      prescriptionItemId?: string;
      quantityDispensed?: string;
      batchNumber?: string;
      expiryDate?: string;
      notes?: string;
    };

    if (!body.id || !body.prescriptionItemId || !body.quantityDispensed) {
      res.status(400).json({
        error: "id, prescriptionItemId and quantityDispensed are required",
      });
      return;
    }

    const [dispensed] = await db
      .insert(dispensations)
      .values({
        id: body.id,
        prescriptionItemId: body.prescriptionItemId,
        dispensedByUserId: req.user.id,
        quantityDispensed: body.quantityDispensed,
        batchNumber: body.batchNumber,
        expiryDate: body.expiryDate,
        notes: body.notes,
      })
      .returning();

    await db
      .update(prescriptionItems)
      .set({ dispenseStatus: "dispensed", updatedAt: new Date() })
      .where(eq(prescriptionItems.id, body.prescriptionItemId));

    res.status(201).json({ data: dispensed });
  } catch (error) {
    next(error);
  }
});

export default router;
