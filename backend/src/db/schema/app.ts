import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	index,
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { user } from "./auth.js";

const timestamps = {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
};

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const maritalStatusEnum = pgEnum("marital_status", [
	"single",
	"married",
	"divorced",
	"widowed",
	"separated",
]);
export const patientStatusEnum = pgEnum("patient_status", [
	"active",
	"inactive",
	"deceased",
]);
export const insuranceStatusEnum = pgEnum("insurance_status", [
	"active",
	"inactive",
	"pending",
	"expired",
	"rejected",
]);
export const encounterTypeEnum = pgEnum("encounter_type", [
	"opd",
	"emergency",
	"inpatient",
	"follow_up",
]);
export const encounterStatusEnum = pgEnum("encounter_status", [
	"open",
	"closed",
	"cancelled",
]);
export const attendanceStageEnum = pgEnum("attendance_stage", [
	"registry",
	"insurance",
	"vitals",
	"consultation",
	"laboratory",
	"pharmacy",
	"ward",
	"closed",
]);
export const consultationOutcomeEnum = pgEnum("consultation_outcome", [
	"completed",
	"referred",
	"admitted",
	"follow_up",
]);
export const referralDestinationEnum = pgEnum("referral_destination", [
	"laboratory",
	"pharmacy",
	"ward",
	"radiology",
	"other",
]);
export const diagnosisTypeEnum = pgEnum("diagnosis_type", [
	"primary",
	"secondary",
	"provisional",
	"final",
]);
export const labOrderStatusEnum = pgEnum("lab_order_status", [
	"ordered",
	"sample_collected",
	"in_progress",
	"completed",
	"cancelled",
]);
export const dispenseStatusEnum = pgEnum("dispense_status", [
	"pending",
	"partially_dispensed",
	"dispensed",
	"cancelled",
]);
export const admissionStatusEnum = pgEnum("admission_status", [
	"active",
	"discharged",
	"transferred",
	"deceased",
]);
export const bedStatusEnum = pgEnum("bed_status", [
	"available",
	"occupied",
	"blocked",
	"cleaning",
]);
export const medicationRouteEnum = pgEnum("medication_route", [
	"oral",
	"iv",
	"im",
	"sc",
	"topical",
	"inhalation",
	"other",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"paid",
	"failed",
	"refunded",
]);

export const facilitySetup = pgTable("facility_setup", {
	id: text("id").primaryKey(),
	facilityName: text("facility_name").notNull(),
	facilityCode: text("facility_code").notNull().unique(),
	facilityType: text("facility_type"),
	registrationNumber: text("registration_number"),
	taxId: text("tax_id"),
	email: text("email"),
	phone: text("phone"),
	website: text("website"),
	addressLine1: text("address_line_1"),
	addressLine2: text("address_line_2"),
	city: text("city"),
	state: text("state"),
	country: text("country"),
	postalCode: text("postal_code"),
	logoUrl: text("logo_url"),
	timezone: text("timezone").notNull().default("Africa/Accra"),
	currencyCode: text("currency_code").notNull().default("GHS"),
	...timestamps,
});

export const insertFacilitySetupSchema = createInsertSchema(facilitySetup);
export const updateFacilitySetupSchema = createUpdateSchema(facilitySetup);

export const departments = pgTable(
	"departments",
	{
		id: text("id").primaryKey(),
		code: text("code").notNull().unique(),
		name: text("name").notNull(),
		description: text("description"),
		isActive: boolean("is_active").notNull().default(true),
		...timestamps,
	},
	(table) => ({
		nameIdx: index("departments_name_idx").on(table.name),
	}),
);

export const staff = pgTable(
	"staff",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
		staffNumber: text("staff_number").notNull().unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		middleName: text("middle_name"),
		title: text("title"),
		phone: text("phone"),
		email: text("email"),
		profession: text("profession"),
		licenseNumber: text("license_number"),
		departmentId: text("department_id").references(() => departments.id, {
			onDelete: "set null",
		}),
		isActive: boolean("is_active").notNull().default(true),
		...timestamps,
	},
	(table) => ({
		userIdx: index("staff_user_id_idx").on(table.userId),
		deptIdx: index("staff_department_id_idx").on(table.departmentId),
	}),
);

export const accessModules = pgTable(
	"access_modules",
	{
		id: text("id").primaryKey(),
		code: text("code").notNull().unique(),
		name: text("name").notNull(),
		description: text("description"),
		...timestamps,
	},
	(table) => ({
		nameIdx: index("access_modules_name_idx").on(table.name),
	}),
);

export const permissions = pgTable(
	"permissions",
	{
		id: text("id").primaryKey(),
		moduleId: text("module_id")
			.notNull()
			.references(() => accessModules.id, { onDelete: "cascade" }),
		code: text("code").notNull().unique(),
		action: text("action").notNull(),
		name: text("name").notNull(),
		description: text("description"),
		...timestamps,
	},
	(table) => ({
		moduleIdx: index("permissions_module_id_idx").on(table.moduleId),
	}),
);

export const accessRoles = pgTable(
	"access_roles",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		code: text("code").notNull().unique(),
		description: text("description"),
		isSystem: boolean("is_system").notNull().default(false),
		createdByUserId: text("created_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		...timestamps,
	},
	(table) => ({
		nameUnique: unique("access_roles_name_unique").on(table.name),
		createdByIdx: index("access_roles_created_by_idx").on(table.createdByUserId),
	}),
);

export const accessRolePermissions = pgTable(
	"access_role_permissions",
	{
		roleId: text("role_id")
			.notNull()
			.references(() => accessRoles.id, { onDelete: "cascade" }),
		permissionId: text("permission_id")
			.notNull()
			.references(() => permissions.id, { onDelete: "cascade" }),
		createdByUserId: text("created_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		...timestamps,
	},
	(table) => ({
		pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
		permissionIdx: index("access_role_permissions_permission_idx").on(
			table.permissionId,
		),
	}),
);

export const userAccessRoles = pgTable(
	"user_access_roles",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		roleId: text("role_id")
			.notNull()
			.references(() => accessRoles.id, { onDelete: "cascade" }),
		assignedByUserId: text("assigned_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		assignedAt: timestamp("assigned_at").defaultNow().notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.roleId] }),
		roleIdx: index("user_access_roles_role_id_idx").on(table.roleId),
	}),
);

export const patients = pgTable(
	"patients",
	{
		id: text("id").primaryKey(),
		hospitalNumber: text("hospital_number").notNull().unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		middleName: text("middle_name"),
		dateOfBirth: date("date_of_birth"),
		gender: genderEnum("gender"),
		maritalStatus: maritalStatusEnum("marital_status"),
		bloodGroup: text("blood_group"),
		genotype: text("genotype"),
		phone: text("phone"),
		alternatePhone: text("alternate_phone"),
		email: text("email"),
		address: text("address"),
		city: text("city"),
		state: text("state"),
		country: text("country"),
		occupation: text("occupation"),
		nationality: text("nationality"),
		nextOfKinName: text("next_of_kin_name"),
		nextOfKinPhone: text("next_of_kin_phone"),
		nextOfKinRelationship: text("next_of_kin_relationship"),
		allergies: text("allergies"),
		chronicConditions: text("chronic_conditions"),
		status: patientStatusEnum("status").notNull().default("active"),
		...timestamps,
	},
	(table) => ({
		hospitalNoIdx: index("patients_hospital_number_idx").on(table.hospitalNumber),
		fullNameIdx: index("patients_name_idx").on(table.lastName, table.firstName),
		phoneIdx: index("patients_phone_idx").on(table.phone),
	}),
);

export const insuranceProviders = pgTable("insurance_providers", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	name: text("name").notNull(),
	contactPhone: text("contact_phone"),
	contactEmail: text("contact_email"),
	isActive: boolean("is_active").notNull().default(true),
	...timestamps,
});

export const patientInsurances = pgTable(
	"patient_insurances",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id")
			.notNull()
			.references(() => patients.id, { onDelete: "cascade" }),
		providerId: text("provider_id")
			.notNull()
			.references(() => insuranceProviders.id, { onDelete: "restrict" }),
		memberNumber: text("member_number").notNull(),
		planName: text("plan_name"),
		policyHolderName: text("policy_holder_name"),
		validFrom: date("valid_from"),
		validTo: date("valid_to"),
		status: insuranceStatusEnum("status").notNull().default("active"),
		isPrimary: boolean("is_primary").notNull().default(false),
		...timestamps,
	},
	(table) => ({
		patientIdx: index("patient_insurances_patient_idx").on(table.patientId),
		memberIdx: index("patient_insurances_member_idx").on(table.memberNumber),
		uniquePolicy: unique("patient_insurances_unique_policy").on(
			table.patientId,
			table.providerId,
			table.memberNumber,
		),
	}),
);

export const encounters = pgTable(
	"encounters",
	{
		id: text("id").primaryKey(),
		encounterNumber: text("encounter_number").notNull().unique(),
		patientId: text("patient_id")
			.notNull()
			.references(() => patients.id, { onDelete: "restrict" }),
		encounterType: encounterTypeEnum("encounter_type").notNull().default("opd"),
		status: encounterStatusEnum("status").notNull().default("open"),
		currentStage: attendanceStageEnum("current_stage").notNull().default("registry"),
		registryUserId: text("registry_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		insuranceVerified: boolean("insurance_verified").notNull().default(false),
		triagePriority: text("triage_priority"),
		openedAt: timestamp("opened_at").defaultNow().notNull(),
		closedAt: timestamp("closed_at"),
		closeReason: text("close_reason"),
		...timestamps,
	},
	(table) => ({
		patientIdx: index("encounters_patient_idx").on(table.patientId),
		statusIdx: index("encounters_status_idx").on(table.status, table.currentStage),
		openDateIdx: index("encounters_opened_at_idx").on(table.openedAt),
	}),
);

export const insuranceVerifications = pgTable(
	"insurance_verifications",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		patientInsuranceId: text("patient_insurance_id")
			.notNull()
			.references(() => patientInsurances.id, { onDelete: "restrict" }),
		verifiedByUserId: text("verified_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		status: insuranceStatusEnum("status").notNull(),
		responseCode: text("response_code"),
		responseMessage: text("response_message"),
		payload: jsonb("payload"),
		verifiedAt: timestamp("verified_at").defaultNow().notNull(),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("insurance_verifications_encounter_idx").on(table.encounterId),
		policyIdx: index("insurance_verifications_policy_idx").on(table.patientInsuranceId),
	}),
);

export const encounterTransitions = pgTable(
	"encounter_transitions",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		fromStage: attendanceStageEnum("from_stage"),
		toStage: attendanceStageEnum("to_stage").notNull(),
		notes: text("notes"),
		changedByUserId: text("changed_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		changedAt: timestamp("changed_at").defaultNow().notNull(),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("encounter_transitions_encounter_idx").on(table.encounterId),
	}),
);

export const vitals = pgTable(
	"vitals",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		recordedByUserId: text("recorded_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		recordedAt: timestamp("recorded_at").defaultNow().notNull(),
		temperatureC: numeric("temperature_c", { precision: 5, scale: 2 }),
		systolicBp: integer("systolic_bp"),
		diastolicBp: integer("diastolic_bp"),
		pulseRate: integer("pulse_rate"),
		respiratoryRate: integer("respiratory_rate"),
		oxygenSaturation: numeric("oxygen_saturation", { precision: 5, scale: 2 }),
		weightKg: numeric("weight_kg", { precision: 7, scale: 2 }),
		heightCm: numeric("height_cm", { precision: 7, scale: 2 }),
		bmi: numeric("bmi", { precision: 7, scale: 2 }),
		painScore: integer("pain_score"),
		notes: text("notes"),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("vitals_encounter_idx").on(table.encounterId),
		recordedIdx: index("vitals_recorded_at_idx").on(table.recordedAt),
	}),
);

export const consultations = pgTable(
	"consultations",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		clinicianUserId: text("clinician_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		startedAt: timestamp("started_at").defaultNow().notNull(),
		endedAt: timestamp("ended_at"),
		chiefComplaint: text("chief_complaint"),
		historyOfPresentingComplaint: text("history_of_presenting_complaint"),
		pastMedicalHistory: text("past_medical_history"),
		medicationHistory: text("medication_history"),
		familyHistory: text("family_history"),
		socialHistory: text("social_history"),
		physicalExamination: text("physical_examination"),
		assessment: text("assessment"),
		plan: text("plan"),
		outcome: consultationOutcomeEnum("outcome").default("completed").notNull(),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("consultations_encounter_idx").on(table.encounterId),
		clinicianIdx: index("consultations_clinician_idx").on(table.clinicianUserId),
	}),
);

export const consultationDiagnoses = pgTable(
	"consultation_diagnoses",
	{
		id: text("id").primaryKey(),
		consultationId: text("consultation_id")
			.notNull()
			.references(() => consultations.id, { onDelete: "cascade" }),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		diagnosisType: diagnosisTypeEnum("diagnosis_type").notNull(),
		icd11Code: text("icd11_code"),
		icd11Title: text("icd11_title"),
		gDrgCode: text("g_drg_code"),
		gDrgTitle: text("g_drg_title"),
		notes: text("notes"),
		...timestamps,
	},
	(table) => ({
		consultationIdx: index("consultation_diagnoses_consultation_idx").on(
			table.consultationId,
		),
		icdIdx: index("consultation_diagnoses_icd_idx").on(table.icd11Code),
		gdrgIdx: index("consultation_diagnoses_gdrg_idx").on(table.gDrgCode),
	}),
);

export const consultationReferrals = pgTable(
	"consultation_referrals",
	{
		id: text("id").primaryKey(),
		consultationId: text("consultation_id")
			.notNull()
			.references(() => consultations.id, { onDelete: "cascade" }),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		destination: referralDestinationEnum("destination").notNull(),
		referredToDepartmentId: text("referred_to_department_id").references(
			() => departments.id,
			{ onDelete: "set null" },
		),
		reason: text("reason"),
		referredByUserId: text("referred_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("consultation_referrals_encounter_idx").on(table.encounterId),
	}),
);

export const laboratoryTests = pgTable(
	"laboratory_tests",
	{
		id: text("id").primaryKey(),
		code: text("code").notNull().unique(),
		name: text("name").notNull(),
		category: text("category"),
		specimenType: text("specimen_type"),
		description: text("description"),
		isActive: boolean("is_active").notNull().default(true),
		...timestamps,
	},
	(table) => ({
		nameIdx: index("laboratory_tests_name_idx").on(table.name),
	}),
);

export const laboratoryTestParameters = pgTable(
	"laboratory_test_parameters",
	{
		id: text("id").primaryKey(),
		testId: text("test_id")
			.notNull()
			.references(() => laboratoryTests.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		unit: text("unit"),
		referenceRange: text("reference_range"),
		sortOrder: integer("sort_order").notNull().default(0),
		isRequired: boolean("is_required").notNull().default(true),
		...timestamps,
	},
	(table) => ({
		testIdx: index("laboratory_test_parameters_test_idx").on(table.testId),
	}),
);

export const laboratoryOrders = pgTable(
	"laboratory_orders",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		consultationId: text("consultation_id").references(() => consultations.id, {
			onDelete: "set null",
		}),
		orderedByUserId: text("ordered_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		status: labOrderStatusEnum("status").notNull().default("ordered"),
		priority: text("priority"),
		clinicalNotes: text("clinical_notes"),
		orderedAt: timestamp("ordered_at").defaultNow().notNull(),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("laboratory_orders_encounter_idx").on(table.encounterId),
		statusIdx: index("laboratory_orders_status_idx").on(table.status),
	}),
);

export const laboratoryOrderItems = pgTable(
	"laboratory_order_items",
	{
		id: text("id").primaryKey(),
		laboratoryOrderId: text("laboratory_order_id")
			.notNull()
			.references(() => laboratoryOrders.id, { onDelete: "cascade" }),
		testId: text("test_id")
			.notNull()
			.references(() => laboratoryTests.id, { onDelete: "restrict" }),
		instructions: text("instructions"),
		status: labOrderStatusEnum("status").notNull().default("ordered"),
		sampleCollectedByUserId: text("sample_collected_by_user_id").references(
			() => user.id,
			{ onDelete: "set null" },
		),
		sampleCollectedAt: timestamp("sample_collected_at"),
		resultedAt: timestamp("resulted_at"),
		verifiedByUserId: text("verified_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		...timestamps,
	},
	(table) => ({
		orderIdx: index("laboratory_order_items_order_idx").on(table.laboratoryOrderId),
		testIdx: index("laboratory_order_items_test_idx").on(table.testId),
	}),
);

export const laboratoryResults = pgTable(
	"laboratory_results",
	{
		id: text("id").primaryKey(),
		orderItemId: text("order_item_id")
			.notNull()
			.references(() => laboratoryOrderItems.id, { onDelete: "cascade" }),
		parameterId: text("parameter_id").references(() => laboratoryTestParameters.id, {
			onDelete: "set null",
		}),
		valueText: text("value_text"),
		valueNumeric: numeric("value_numeric", { precision: 14, scale: 4 }),
		unit: text("unit"),
		flag: text("flag"),
		comments: text("comments"),
		enteredByUserId: text("entered_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		verifiedByUserId: text("verified_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		enteredAt: timestamp("entered_at").defaultNow().notNull(),
		verifiedAt: timestamp("verified_at"),
		...timestamps,
	},
	(table) => ({
		itemIdx: index("laboratory_results_item_idx").on(table.orderItemId),
		paramIdx: index("laboratory_results_parameter_idx").on(table.parameterId),
	}),
);

export const medicines = pgTable(
	"medicines",
	{
		id: text("id").primaryKey(),
		medicineCode: text("medicine_code").notNull().unique(),
		genericName: text("generic_name").notNull(),
		brandName: text("brand_name"),
		dosageForm: text("dosage_form"),
		strength: text("strength"),
		unit: text("unit"),
		route: medicationRouteEnum("route"),
		isControlled: boolean("is_controlled").notNull().default(false),
		isActive: boolean("is_active").notNull().default(true),
		...timestamps,
	},
	(table) => ({
		genericNameIdx: index("medicines_generic_name_idx").on(table.genericName),
	}),
);

export const prescriptions = pgTable(
	"prescriptions",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "cascade" }),
		consultationId: text("consultation_id").references(() => consultations.id, {
			onDelete: "set null",
		}),
		prescribedByUserId: text("prescribed_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		notes: text("notes"),
		status: dispenseStatusEnum("status").notNull().default("pending"),
		prescribedAt: timestamp("prescribed_at").defaultNow().notNull(),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("prescriptions_encounter_idx").on(table.encounterId),
		statusIdx: index("prescriptions_status_idx").on(table.status),
	}),
);

export const prescriptionItems = pgTable(
	"prescription_items",
	{
		id: text("id").primaryKey(),
		prescriptionId: text("prescription_id")
			.notNull()
			.references(() => prescriptions.id, { onDelete: "cascade" }),
		medicineId: text("medicine_id")
			.notNull()
			.references(() => medicines.id, { onDelete: "restrict" }),
		dose: text("dose"),
		route: medicationRouteEnum("route"),
		frequency: text("frequency"),
		durationDays: integer("duration_days"),
		quantityPrescribed: numeric("quantity_prescribed", { precision: 14, scale: 2 }),
		instructions: text("instructions"),
		dispenseStatus: dispenseStatusEnum("dispense_status")
			.notNull()
			.default("pending"),
		...timestamps,
	},
	(table) => ({
		prescriptionIdx: index("prescription_items_prescription_idx").on(table.prescriptionId),
		medicineIdx: index("prescription_items_medicine_idx").on(table.medicineId),
	}),
);

export const dispensations = pgTable(
	"dispensations",
	{
		id: text("id").primaryKey(),
		prescriptionItemId: text("prescription_item_id")
			.notNull()
			.references(() => prescriptionItems.id, { onDelete: "cascade" }),
		dispensedByUserId: text("dispensed_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		quantityDispensed: numeric("quantity_dispensed", { precision: 14, scale: 2 })
			.notNull(),
		batchNumber: text("batch_number"),
		expiryDate: date("expiry_date"),
		dispensedAt: timestamp("dispensed_at").defaultNow().notNull(),
		notes: text("notes"),
		...timestamps,
	},
	(table) => ({
		itemIdx: index("dispensations_prescription_item_idx").on(table.prescriptionItemId),
	}),
);

export const wards = pgTable("wards", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	name: text("name").notNull(),
	wardType: text("ward_type"),
	capacity: integer("capacity"),
	isActive: boolean("is_active").notNull().default(true),
	...timestamps,
});

export const wardBeds = pgTable(
	"ward_beds",
	{
		id: text("id").primaryKey(),
		wardId: text("ward_id")
			.notNull()
			.references(() => wards.id, { onDelete: "cascade" }),
		bedNumber: text("bed_number").notNull(),
		status: bedStatusEnum("status").notNull().default("available"),
		...timestamps,
	},
	(table) => ({
		wardIdx: index("ward_beds_ward_idx").on(table.wardId),
		uniqueBed: unique("ward_beds_unique_bed_number").on(table.wardId, table.bedNumber),
	}),
);

export const admissions = pgTable(
	"admissions",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id")
			.notNull()
			.references(() => encounters.id, { onDelete: "restrict" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => patients.id, { onDelete: "restrict" }),
		admittingConsultationId: text("admitting_consultation_id").references(
			() => consultations.id,
			{ onDelete: "set null" },
		),
		admittedByUserId: text("admitted_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		wardId: text("ward_id").references(() => wards.id, { onDelete: "set null" }),
		wardBedId: text("ward_bed_id").references(() => wardBeds.id, {
			onDelete: "set null",
		}),
		admissionDiagnosis: text("admission_diagnosis"),
		status: admissionStatusEnum("status").notNull().default("active"),
		admittedAt: timestamp("admitted_at").defaultNow().notNull(),
		dischargedAt: timestamp("discharged_at"),
		dischargeSummary: text("discharge_summary"),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("admissions_encounter_idx").on(table.encounterId),
		patientIdx: index("admissions_patient_idx").on(table.patientId),
		statusIdx: index("admissions_status_idx").on(table.status),
	}),
);

export const medicationAdministrations = pgTable(
	"medication_administrations",
	{
		id: text("id").primaryKey(),
		admissionId: text("admission_id")
			.notNull()
			.references(() => admissions.id, { onDelete: "cascade" }),
		prescriptionItemId: text("prescription_item_id").references(
			() => prescriptionItems.id,
			{ onDelete: "set null" },
		),
		administeredByUserId: text("administered_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		doseGiven: text("dose_given"),
		route: medicationRouteEnum("route"),
		administeredAt: timestamp("administered_at").defaultNow().notNull(),
		notes: text("notes"),
		...timestamps,
	},
	(table) => ({
		admissionIdx: index("medication_administrations_admission_idx").on(table.admissionId),
	}),
);

export const nursingNotes = pgTable(
	"nursing_notes",
	{
		id: text("id").primaryKey(),
		admissionId: text("admission_id")
			.notNull()
			.references(() => admissions.id, { onDelete: "cascade" }),
		authoredByUserId: text("authored_by_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		noteType: text("note_type"),
		note: text("note").notNull(),
		notedAt: timestamp("noted_at").defaultNow().notNull(),
		...timestamps,
	},
	(table) => ({
		admissionIdx: index("nursing_notes_admission_idx").on(table.admissionId),
	}),
);

export const categories = pgTable(
	"categories",
	{
		id: text("id").primaryKey(),
		code: text("code").notNull().unique(),
		name: text("name").notNull(),
		description: text("description"),
		isActive: boolean("is_active").notNull().default(true),
		...timestamps,
	},
	(table) => ({
		nameIdx: index("categories_name_idx").on(table.name),
	}),
);

export const paymentRecipients = pgTable(
	"payment_recipients",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		type: text("type").notNull().default("facility"),
		staffId: text("staff_id").references(() => staff.id, { onDelete: "set null" }),
		isActive: boolean("is_active").notNull().default(true),
		...timestamps,
	},
	(table) => ({
		staffIdx: index("payment_recipients_staff_idx").on(table.staffId),
	}),
);

export const payments = pgTable(
	"payments",
	{
		id: text("id").primaryKey(),
		encounterId: text("encounter_id").references(() => encounters.id, {
			onDelete: "set null",
		}),
		patientId: text("patient_id").references(() => patients.id, {
			onDelete: "set null",
		}),
		categoryId: text("category_id").references(() => categories.id, {
			onDelete: "set null",
		}),
		recipientId: text("recipient_id").references(() => paymentRecipients.id, {
			onDelete: "set null",
		}),
		amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
		currency: text("currency").notNull().default("NGN"),
		method: text("method"),
		reference: text("reference"),
		status: paymentStatusEnum("status").notNull().default("pending"),
		paidAt: timestamp("paid_at"),
		...timestamps,
	},
	(table) => ({
		encounterIdx: index("payments_encounter_idx").on(table.encounterId),
		patientIdx: index("payments_patient_idx").on(table.patientId),
		statusIdx: index("payments_status_idx").on(table.status),
	}),
);

export const patientsRelations = relations(patients, ({ many }) => ({
	encounters: many(encounters),
	insurances: many(patientInsurances),
	admissions: many(admissions),
}));

export const encountersRelations = relations(encounters, ({ one, many }) => ({
	patient: one(patients, {
		fields: [encounters.patientId],
		references: [patients.id],
	}),
	vitals: many(vitals),
	consultations: many(consultations),
	labOrders: many(laboratoryOrders),
	prescriptions: many(prescriptions),
	transitions: many(encounterTransitions),
	admissions: many(admissions),
	payments: many(payments),
}));

export const consultationsRelations = relations(consultations, ({ many, one }) => ({
	encounter: one(encounters, {
		fields: [consultations.encounterId],
		references: [encounters.id],
	}),
	diagnoses: many(consultationDiagnoses),
	referrals: many(consultationReferrals),
}));

export type FacilitySetup = typeof facilitySetup.$inferSelect;
export type NewFacilitySetup = typeof facilitySetup.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Encounter = typeof encounters.$inferSelect;
export type NewEncounter = typeof encounters.$inferInsert;
export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;
