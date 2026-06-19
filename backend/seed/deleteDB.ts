import { db } from "../src/db/index.js";
import { account, session, user, verification } from "../src/db/schema/auth.js";
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

async function main() {
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

  console.log("Database deletion completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Database deletion failed:", error);
    process.exit(1);
  });
