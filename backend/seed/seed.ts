import { readFile } from "node:fs/promises";

import { db } from "../src/db/index.js";
import {
  admissions,
  categories,
  consultationDiagnoses,
  consultationReferrals,
  consultations,
  departments,
  dispensations,
  encounterTransitions,
  encounters,
  insuranceProviders,
  insuranceVerifications,
  laboratoryOrderItems,
  laboratoryOrders,
  laboratoryResults,
  laboratoryTestParameters,
  laboratoryTests,
  medicationAdministrations,
  medicines,
  type NewPatient,
  nursingNotes,
  patientInsurances,
  patients,
  paymentRecipients,
  payments,
  prescriptionItems,
  prescriptions,
  staff,
  vitals,
  wardBeds,
  wards,
} from "../src/db/schema/app.js";

type SeedData = {
  departments: Array<{
    id: string;
    code: string;
    name: string;
    description?: string;
  }>;
  insuranceProviders: Array<{
    id: string;
    code: string;
    name: string;
    contactPhone?: string;
    contactEmail?: string;
  }>;
  patients: Array<{
    id: string;
    hospitalNumber: string;
    firstName: string;
    lastName: string;
    phone?: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: string;
    status?: "active" | "inactive" | "deceased";
  }>;
  medicines: Array<{
    id: string;
    medicineCode: string;
    genericName: string;
    dosageForm?: string;
    strength?: string;
    unit?: string;
  }>;
  laboratoryTests: Array<{
    id: string;
    code: string;
    name: string;
    category?: string;
    specimenType?: string;
  }>;
  wards: Array<{
    id: string;
    code: string;
    name: string;
    wardType?: string;
    capacity?: number;
  }>;
};

async function loadSeedData(): Promise<SeedData> {
  const raw = await readFile(new URL("./data.json", import.meta.url), "utf8");
  return JSON.parse(raw) as SeedData;
}

async function clearTables() {
  await db.delete(payments);
  await db.delete(paymentRecipients);
  await db.delete(categories);

  await db.delete(medicationAdministrations);
  await db.delete(nursingNotes);
  await db.delete(admissions);
  await db.delete(wardBeds);
  await db.delete(wards);

  await db.delete(dispensations);
  await db.delete(prescriptionItems);
  await db.delete(prescriptions);
  await db.delete(medicines);

  await db.delete(laboratoryResults);
  await db.delete(laboratoryOrderItems);
  await db.delete(laboratoryOrders);
  await db.delete(laboratoryTestParameters);
  await db.delete(laboratoryTests);

  await db.delete(consultationDiagnoses);
  await db.delete(consultationReferrals);
  await db.delete(consultations);
  await db.delete(vitals);

  await db.delete(encounterTransitions);
  await db.delete(insuranceVerifications);
  await db.delete(encounters);
  await db.delete(patientInsurances);
  await db.delete(insuranceProviders);
  await db.delete(patients);

  await db.delete(staff);
  await db.delete(departments);
}

async function main() {
  const data = await loadSeedData();
  const now = new Date();

  await clearTables();

  await db.insert(departments).values(
    data.departments.map((item) => ({
      ...item,
      isActive: true,
    })),
  );

  await db.insert(staff).values([
    {
      id: "staff_001",
      userId: "admin_1",
      staffNumber: "STF-0001",
      firstName: "System",
      lastName: "Admin",
      profession: "Administrator",
      departmentId: "dep_registry",
      isActive: true,
    },
    {
      id: "staff_002",
      staffNumber: "STF-0002",
      firstName: "Grace",
      lastName: "Ofori",
      profession: "Consultant",
      departmentId: "dep_consult",
      isActive: true,
    },
  ]);

  await db.insert(insuranceProviders).values(
    data.insuranceProviders.map((item) => ({
      ...item,
      isActive: true,
    })),
  );

  await db.insert(patients).values(
    data.patients.map((item): NewPatient => ({
      id: item.id,
      hospitalNumber: item.hospitalNumber,
      firstName: item.firstName,
      lastName: item.lastName,
      phone: item.phone,
      gender: item.gender,
      dateOfBirth: item.dateOfBirth,
      status: item.status ?? "active",
    })),
  );

  await db.insert(patientInsurances).values([
    {
      id: "pins_001",
      patientId: "pat_001",
      providerId: data.insuranceProviders[0].id,
      memberNumber: "NHIA-10001",
      planName: "Standard",
      policyHolderName: "Kwame Mensah",
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      status: "active",
      isPrimary: true,
    },
    {
      id: "pins_002",
      patientId: "pat_002",
      providerId: data.insuranceProviders[1].id,
      memberNumber: "BST-10002",
      planName: "Premium",
      policyHolderName: "Ama Boateng",
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      status: "active",
      isPrimary: true,
    },
  ]);

  await db.insert(encounters).values([
    {
      id: "enc_001",
      encounterNumber: "ENC-2026-0001",
      patientId: "pat_001",
      encounterType: "opd",
      status: "open",
      currentStage: "consultation",
      registryUserId: "admin_1",
      insuranceVerified: true,
      openedAt: now,
    },
    {
      id: "enc_002",
      encounterNumber: "ENC-2026-0002",
      patientId: "pat_002",
      encounterType: "inpatient",
      status: "open",
      currentStage: "ward",
      registryUserId: "admin_1",
      insuranceVerified: true,
      openedAt: now,
    },
  ]);

  await db.insert(insuranceVerifications).values([
    {
      id: "insver_001",
      encounterId: "enc_001",
      patientInsuranceId: "pins_001",
      verifiedByUserId: "admin_1",
      status: "active",
      responseCode: "00",
      responseMessage: "Eligible",
      payload: { source: "seed" },
      verifiedAt: now,
    },
    {
      id: "insver_002",
      encounterId: "enc_002",
      patientInsuranceId: "pins_002",
      verifiedByUserId: "admin_1",
      status: "active",
      responseCode: "00",
      responseMessage: "Eligible",
      payload: { source: "seed" },
      verifiedAt: now,
    },
  ]);

  await db.insert(encounterTransitions).values([
    {
      id: "trans_001",
      encounterId: "enc_001",
      fromStage: "registry",
      toStage: "insurance",
      changedByUserId: "admin_1",
      changedAt: now,
    },
    {
      id: "trans_002",
      encounterId: "enc_001",
      fromStage: "insurance",
      toStage: "vitals",
      changedByUserId: "admin_1",
      changedAt: now,
    },
    {
      id: "trans_003",
      encounterId: "enc_001",
      fromStage: "vitals",
      toStage: "consultation",
      changedByUserId: "admin_1",
      changedAt: now,
    },
  ]);

  await db.insert(vitals).values([
    {
      id: "vit_001",
      encounterId: "enc_001",
      recordedByUserId: "admin_1",
      temperatureC: "36.8",
      systolicBp: 122,
      diastolicBp: 80,
      pulseRate: 78,
      respiratoryRate: 18,
      oxygenSaturation: "98.0",
      weightKg: "74.2",
      heightCm: "174.0",
      bmi: "24.5",
      notes: "Stable vitals",
      recordedAt: now,
    },
  ]);

  await db.insert(consultations).values([
    {
      id: "cons_001",
      encounterId: "enc_001",
      clinicianUserId: "admin_1",
      chiefComplaint: "Fever and body pain",
      assessment: "Likely uncomplicated malaria",
      plan: "Request labs and prescribe meds",
      outcome: "referred",
      startedAt: now,
    },
  ]);

  await db.insert(consultationDiagnoses).values([
    {
      id: "diag_001",
      consultationId: "cons_001",
      encounterId: "enc_001",
      diagnosisType: "provisional",
      icd11Code: "1A00",
      icd11Title: "Malaria",
      gDrgCode: "GDRG-100",
      gDrgTitle: "Infectious Disease Group",
    },
  ]);

  await db.insert(laboratoryTests).values(
    data.laboratoryTests.map((item) => ({
      ...item,
      isActive: true,
    })),
  );

  await db.insert(laboratoryTestParameters).values([
    {
      id: "ltp_001",
      testId: "lab_fbc",
      name: "Hemoglobin",
      unit: "g/dL",
      referenceRange: "12-16",
      sortOrder: 1,
    },
    {
      id: "ltp_002",
      testId: "lab_rbs",
      name: "Glucose",
      unit: "mmol/L",
      referenceRange: "4.0-7.8",
      sortOrder: 1,
    },
  ]);

  await db.insert(laboratoryOrders).values([
    {
      id: "lord_001",
      encounterId: "enc_001",
      consultationId: "cons_001",
      orderedByUserId: "admin_1",
      status: "completed",
      priority: "routine",
      orderedAt: now,
    },
  ]);

  await db.insert(laboratoryOrderItems).values([
    {
      id: "loi_001",
      laboratoryOrderId: "lord_001",
      testId: "lab_fbc",
      status: "completed",
      sampleCollectedByUserId: "admin_1",
      sampleCollectedAt: now,
      resultedAt: now,
      verifiedByUserId: "admin_1",
    },
    {
      id: "loi_002",
      laboratoryOrderId: "lord_001",
      testId: "lab_rbs",
      status: "completed",
      sampleCollectedByUserId: "admin_1",
      sampleCollectedAt: now,
      resultedAt: now,
      verifiedByUserId: "admin_1",
    },
  ]);

  await db.insert(laboratoryResults).values([
    {
      id: "lres_001",
      orderItemId: "loi_001",
      parameterId: "ltp_001",
      valueNumeric: "11.8",
      unit: "g/dL",
      enteredByUserId: "admin_1",
      verifiedByUserId: "admin_1",
      enteredAt: now,
      verifiedAt: now,
    },
    {
      id: "lres_002",
      orderItemId: "loi_002",
      parameterId: "ltp_002",
      valueNumeric: "5.3",
      unit: "mmol/L",
      enteredByUserId: "admin_1",
      verifiedByUserId: "admin_1",
      enteredAt: now,
      verifiedAt: now,
    },
  ]);

  await db.insert(medicines).values(
    data.medicines.map((item) => ({
      ...item,
      isActive: true,
    })),
  );

  await db.insert(prescriptions).values([
    {
      id: "rx_001",
      encounterId: "enc_001",
      consultationId: "cons_001",
      prescribedByUserId: "admin_1",
      notes: "OPD medication",
      status: "dispensed",
      prescribedAt: now,
    },
  ]);

  await db.insert(prescriptionItems).values([
    {
      id: "rxi_001",
      prescriptionId: "rx_001",
      medicineId: "med_001",
      dose: "1 tab",
      route: "oral",
      frequency: "q8h",
      durationDays: 3,
      quantityPrescribed: "9",
      instructions: "After meals",
      dispenseStatus: "dispensed",
    },
  ]);

  await db.insert(dispensations).values([
    {
      id: "disp_001",
      prescriptionItemId: "rxi_001",
      dispensedByUserId: "admin_1",
      quantityDispensed: "9",
      batchNumber: "BATCH-001",
      expiryDate: "2027-12-31",
      dispensedAt: now,
    },
  ]);

  await db.insert(wards).values(
    data.wards.map((item) => ({
      ...item,
      isActive: true,
    })),
  );

  await db.insert(wardBeds).values([
    {
      id: "bed_001",
      wardId: "ward_med",
      bedNumber: "A-01",
      status: "occupied",
    },
    {
      id: "bed_002",
      wardId: "ward_med",
      bedNumber: "A-02",
      status: "available",
    },
  ]);

  await db.insert(admissions).values([
    {
      id: "adm_001",
      encounterId: "enc_002",
      patientId: "pat_002",
      admittedByUserId: "admin_1",
      wardId: "ward_med",
      wardBedId: "bed_001",
      admissionDiagnosis: "Severe dehydration",
      status: "active",
      admittedAt: now,
    },
  ]);

  await db.insert(categories).values([
    { id: "cat_cons", code: "CONS", name: "Consultation", isActive: true },
    { id: "cat_lab", code: "LAB", name: "Laboratory", isActive: true },
    { id: "cat_pharm", code: "PHARM", name: "Pharmacy", isActive: true },
  ]);

  await db.insert(paymentRecipients).values([
    {
      id: "prec_001",
      name: "Main Cashier",
      type: "facility",
      staffId: "staff_001",
      isActive: true,
    },
  ]);

  await db.insert(payments).values([
    {
      id: "pay_001",
      encounterId: "enc_001",
      patientId: "pat_001",
      categoryId: "cat_cons",
      recipientId: "prec_001",
      amount: "150.00",
      currency: "GHS",
      method: "cash",
      reference: "PMT-0001",
      status: "paid",
      paidAt: now,
    },
  ]);

  console.log("Data seed completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Data seed failed:", error);
    process.exit(1);
  });
