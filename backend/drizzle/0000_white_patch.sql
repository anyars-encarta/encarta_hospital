CREATE TYPE "public"."admission_status" AS ENUM('active', 'discharged', 'transferred', 'deceased');--> statement-breakpoint
CREATE TYPE "public"."attendance_stage" AS ENUM('registry', 'insurance', 'vitals', 'consultation', 'laboratory', 'pharmacy', 'ward', 'closed');--> statement-breakpoint
CREATE TYPE "public"."bed_status" AS ENUM('available', 'occupied', 'blocked', 'cleaning');--> statement-breakpoint
CREATE TYPE "public"."consultation_outcome" AS ENUM('completed', 'referred', 'admitted', 'follow_up');--> statement-breakpoint
CREATE TYPE "public"."diagnosis_type" AS ENUM('primary', 'secondary', 'provisional', 'final');--> statement-breakpoint
CREATE TYPE "public"."dispense_status" AS ENUM('pending', 'partially_dispensed', 'dispensed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."encounter_status" AS ENUM('open', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."encounter_type" AS ENUM('opd', 'emergency', 'inpatient', 'follow_up');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."insurance_status" AS ENUM('active', 'inactive', 'pending', 'expired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."lab_order_status" AS ENUM('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('single', 'married', 'divorced', 'widowed', 'separated');--> statement-breakpoint
CREATE TYPE "public"."medication_route" AS ENUM('oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'other');--> statement-breakpoint
CREATE TYPE "public"."patient_status" AS ENUM('active', 'inactive', 'deceased');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."referral_destination" AS ENUM('laboratory', 'pharmacy', 'ward', 'radiology', 'other');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('accounts', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "access_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_modules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "access_role_permissions" (
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "access_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_roles_code_unique" UNIQUE("code"),
	CONSTRAINT "access_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "admissions" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"admitting_consultation_id" text,
	"admitted_by_user_id" text,
	"ward_id" text,
	"ward_bed_id" text,
	"admission_diagnosis" text,
	"status" "admission_status" DEFAULT 'active' NOT NULL,
	"admitted_at" timestamp DEFAULT now() NOT NULL,
	"discharged_at" timestamp,
	"discharge_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "consultation_diagnoses" (
	"id" text PRIMARY KEY NOT NULL,
	"consultation_id" text NOT NULL,
	"encounter_id" text NOT NULL,
	"diagnosis_type" "diagnosis_type" NOT NULL,
	"icd11_code" text,
	"icd11_title" text,
	"g_drg_code" text,
	"g_drg_title" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultation_referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"consultation_id" text NOT NULL,
	"encounter_id" text NOT NULL,
	"destination" "referral_destination" NOT NULL,
	"referred_to_department_id" text,
	"reason" text,
	"referred_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text NOT NULL,
	"clinician_user_id" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"chief_complaint" text,
	"history_of_presenting_complaint" text,
	"past_medical_history" text,
	"medication_history" text,
	"family_history" text,
	"social_history" text,
	"physical_examination" text,
	"assessment" text,
	"plan" text,
	"outcome" "consultation_outcome" DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "dispensations" (
	"id" text PRIMARY KEY NOT NULL,
	"prescription_item_id" text NOT NULL,
	"dispensed_by_user_id" text,
	"quantity_dispensed" numeric(14, 2) NOT NULL,
	"batch_number" text,
	"expiry_date" date,
	"dispensed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter_transitions" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text NOT NULL,
	"from_stage" "attendance_stage",
	"to_stage" "attendance_stage" NOT NULL,
	"notes" text,
	"changed_by_user_id" text,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounters" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_number" text NOT NULL,
	"patient_id" text NOT NULL,
	"encounter_type" "encounter_type" DEFAULT 'opd' NOT NULL,
	"status" "encounter_status" DEFAULT 'open' NOT NULL,
	"current_stage" "attendance_stage" DEFAULT 'registry' NOT NULL,
	"registry_user_id" text,
	"insurance_verified" boolean DEFAULT false NOT NULL,
	"triage_priority" text,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	"close_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "encounters_encounter_number_unique" UNIQUE("encounter_number")
);
--> statement-breakpoint
CREATE TABLE "facility_setup" (
	"id" text PRIMARY KEY NOT NULL,
	"facility_name" text NOT NULL,
	"facility_code" text NOT NULL,
	"facility_type" text,
	"registration_number" text,
	"tax_id" text,
	"email" text,
	"phone" text,
	"website" text,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"logo_url" text,
	"timezone" text DEFAULT 'Africa/Accra' NOT NULL,
	"currency_code" text DEFAULT 'GHS' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "facility_setup_facility_code_unique" UNIQUE("facility_code")
);
--> statement-breakpoint
CREATE TABLE "insurance_providers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "insurance_providers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "insurance_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text NOT NULL,
	"patient_insurance_id" text NOT NULL,
	"verified_by_user_id" text,
	"status" "insurance_status" NOT NULL,
	"response_code" text,
	"response_message" text,
	"payload" jsonb,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laboratory_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"laboratory_order_id" text NOT NULL,
	"test_id" text NOT NULL,
	"instructions" text,
	"status" "lab_order_status" DEFAULT 'ordered' NOT NULL,
	"sample_collected_by_user_id" text,
	"sample_collected_at" timestamp,
	"resulted_at" timestamp,
	"verified_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laboratory_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text NOT NULL,
	"consultation_id" text,
	"ordered_by_user_id" text,
	"status" "lab_order_status" DEFAULT 'ordered' NOT NULL,
	"priority" text,
	"clinical_notes" text,
	"ordered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laboratory_results" (
	"id" text PRIMARY KEY NOT NULL,
	"order_item_id" text NOT NULL,
	"parameter_id" text,
	"value_text" text,
	"value_numeric" numeric(14, 4),
	"unit" text,
	"flag" text,
	"comments" text,
	"entered_by_user_id" text,
	"verified_by_user_id" text,
	"entered_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laboratory_test_parameters" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"name" text NOT NULL,
	"unit" text,
	"reference_range" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laboratory_tests" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"specimen_type" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "laboratory_tests_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "medication_administrations" (
	"id" text PRIMARY KEY NOT NULL,
	"admission_id" text NOT NULL,
	"prescription_item_id" text,
	"administered_by_user_id" text,
	"dose_given" text,
	"route" "medication_route",
	"administered_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicines" (
	"id" text PRIMARY KEY NOT NULL,
	"medicine_code" text NOT NULL,
	"generic_name" text NOT NULL,
	"brand_name" text,
	"dosage_form" text,
	"strength" text,
	"unit" text,
	"route" "medication_route",
	"is_controlled" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medicines_medicine_code_unique" UNIQUE("medicine_code")
);
--> statement-breakpoint
CREATE TABLE "nursing_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"admission_id" text NOT NULL,
	"authored_by_user_id" text,
	"note_type" text,
	"note" text NOT NULL,
	"noted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_insurances" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"member_number" text NOT NULL,
	"plan_name" text,
	"policy_holder_name" text,
	"valid_from" date,
	"valid_to" date,
	"status" "insurance_status" DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_insurances_unique_policy" UNIQUE("patient_id","provider_id","member_number")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"hospital_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"middle_name" text,
	"date_of_birth" date,
	"gender" "gender",
	"marital_status" "marital_status",
	"blood_group" text,
	"genotype" text,
	"phone" text,
	"alternate_phone" text,
	"email" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"occupation" text,
	"nationality" text,
	"next_of_kin_name" text,
	"next_of_kin_phone" text,
	"next_of_kin_relationship" text,
	"allergies" text,
	"chronic_conditions" text,
	"status" "patient_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_hospital_number_unique" UNIQUE("hospital_number")
);
--> statement-breakpoint
CREATE TABLE "payment_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'facility' NOT NULL,
	"staff_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text,
	"patient_id" text,
	"category_id" text,
	"recipient_id" text,
	"amount" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"method" text,
	"reference" text,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"code" text NOT NULL,
	"action" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" text PRIMARY KEY NOT NULL,
	"prescription_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"dose" text,
	"route" "medication_route",
	"frequency" text,
	"duration_days" integer,
	"quantity_prescribed" numeric(14, 2),
	"instructions" text,
	"dispense_status" "dispense_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text NOT NULL,
	"consultation_id" text,
	"prescribed_by_user_id" text,
	"notes" text,
	"status" "dispense_status" DEFAULT 'pending' NOT NULL,
	"prescribed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"staff_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"middle_name" text,
	"title" text,
	"phone" text,
	"email" text,
	"profession" text,
	"license_number" text,
	"department_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_staff_number_unique" UNIQUE("staff_number")
);
--> statement-breakpoint
CREATE TABLE "user_access_roles" (
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"assigned_by_user_id" text,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_access_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "vitals" (
	"id" text PRIMARY KEY NOT NULL,
	"encounter_id" text NOT NULL,
	"recorded_by_user_id" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"temperature_c" numeric(5, 2),
	"systolic_bp" integer,
	"diastolic_bp" integer,
	"pulse_rate" integer,
	"respiratory_rate" integer,
	"oxygen_saturation" numeric(5, 2),
	"weight_kg" numeric(7, 2),
	"height_cm" numeric(7, 2),
	"bmi" numeric(7, 2),
	"pain_score" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ward_beds" (
	"id" text PRIMARY KEY NOT NULL,
	"ward_id" text NOT NULL,
	"bed_number" text NOT NULL,
	"status" "bed_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ward_beds_unique_bed_number" UNIQUE("ward_id","bed_number")
);
--> statement-breakpoint
CREATE TABLE "wards" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"ward_type" text,
	"capacity" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_account_id_unique" UNIQUE("account_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'accounts' NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"image_cld_pub_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_role_permissions" ADD CONSTRAINT "access_role_permissions_role_id_access_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."access_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_role_permissions" ADD CONSTRAINT "access_role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_role_permissions" ADD CONSTRAINT "access_role_permissions_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_roles" ADD CONSTRAINT "access_roles_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_admitting_consultation_id_consultations_id_fk" FOREIGN KEY ("admitting_consultation_id") REFERENCES "public"."consultations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_admitted_by_user_id_user_id_fk" FOREIGN KEY ("admitted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_ward_bed_id_ward_beds_id_fk" FOREIGN KEY ("ward_bed_id") REFERENCES "public"."ward_beds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_diagnoses" ADD CONSTRAINT "consultation_diagnoses_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_diagnoses" ADD CONSTRAINT "consultation_diagnoses_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_referrals" ADD CONSTRAINT "consultation_referrals_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_referrals" ADD CONSTRAINT "consultation_referrals_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_referrals" ADD CONSTRAINT "consultation_referrals_referred_to_department_id_departments_id_fk" FOREIGN KEY ("referred_to_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_referrals" ADD CONSTRAINT "consultation_referrals_referred_by_user_id_user_id_fk" FOREIGN KEY ("referred_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_clinician_user_id_user_id_fk" FOREIGN KEY ("clinician_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_prescription_item_id_prescription_items_id_fk" FOREIGN KEY ("prescription_item_id") REFERENCES "public"."prescription_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispensations" ADD CONSTRAINT "dispensations_dispensed_by_user_id_user_id_fk" FOREIGN KEY ("dispensed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_transitions" ADD CONSTRAINT "encounter_transitions_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter_transitions" ADD CONSTRAINT "encounter_transitions_changed_by_user_id_user_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_registry_user_id_user_id_fk" FOREIGN KEY ("registry_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_verifications" ADD CONSTRAINT "insurance_verifications_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_verifications" ADD CONSTRAINT "insurance_verifications_patient_insurance_id_patient_insurances_id_fk" FOREIGN KEY ("patient_insurance_id") REFERENCES "public"."patient_insurances"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_verifications" ADD CONSTRAINT "insurance_verifications_verified_by_user_id_user_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_order_items" ADD CONSTRAINT "laboratory_order_items_laboratory_order_id_laboratory_orders_id_fk" FOREIGN KEY ("laboratory_order_id") REFERENCES "public"."laboratory_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_order_items" ADD CONSTRAINT "laboratory_order_items_test_id_laboratory_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."laboratory_tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_order_items" ADD CONSTRAINT "laboratory_order_items_sample_collected_by_user_id_user_id_fk" FOREIGN KEY ("sample_collected_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_order_items" ADD CONSTRAINT "laboratory_order_items_verified_by_user_id_user_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_orders" ADD CONSTRAINT "laboratory_orders_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_orders" ADD CONSTRAINT "laboratory_orders_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_orders" ADD CONSTRAINT "laboratory_orders_ordered_by_user_id_user_id_fk" FOREIGN KEY ("ordered_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_results" ADD CONSTRAINT "laboratory_results_order_item_id_laboratory_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."laboratory_order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_results" ADD CONSTRAINT "laboratory_results_parameter_id_laboratory_test_parameters_id_fk" FOREIGN KEY ("parameter_id") REFERENCES "public"."laboratory_test_parameters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_results" ADD CONSTRAINT "laboratory_results_entered_by_user_id_user_id_fk" FOREIGN KEY ("entered_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_results" ADD CONSTRAINT "laboratory_results_verified_by_user_id_user_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_test_parameters" ADD CONSTRAINT "laboratory_test_parameters_test_id_laboratory_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."laboratory_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_administrations" ADD CONSTRAINT "medication_administrations_admission_id_admissions_id_fk" FOREIGN KEY ("admission_id") REFERENCES "public"."admissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_administrations" ADD CONSTRAINT "medication_administrations_prescription_item_id_prescription_items_id_fk" FOREIGN KEY ("prescription_item_id") REFERENCES "public"."prescription_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_administrations" ADD CONSTRAINT "medication_administrations_administered_by_user_id_user_id_fk" FOREIGN KEY ("administered_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_admission_id_admissions_id_fk" FOREIGN KEY ("admission_id") REFERENCES "public"."admissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_authored_by_user_id_user_id_fk" FOREIGN KEY ("authored_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_insurances" ADD CONSTRAINT "patient_insurances_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_insurances" ADD CONSTRAINT "patient_insurances_provider_id_insurance_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_recipients" ADD CONSTRAINT "payment_recipients_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recipient_id_payment_recipients_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."payment_recipients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_module_id_access_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."access_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_prescribed_by_user_id_user_id_fk" FOREIGN KEY ("prescribed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_access_roles" ADD CONSTRAINT "user_access_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_access_roles" ADD CONSTRAINT "user_access_roles_role_id_access_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."access_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_access_roles" ADD CONSTRAINT "user_access_roles_assigned_by_user_id_user_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_encounter_id_encounters_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_recorded_by_user_id_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ward_beds" ADD CONSTRAINT "ward_beds_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "access_modules_name_idx" ON "access_modules" USING btree ("name");--> statement-breakpoint
CREATE INDEX "access_role_permissions_permission_idx" ON "access_role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "access_roles_created_by_idx" ON "access_roles" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "admissions_encounter_idx" ON "admissions" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "admissions_patient_idx" ON "admissions" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "admissions_status_idx" ON "admissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "consultation_diagnoses_consultation_idx" ON "consultation_diagnoses" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "consultation_diagnoses_icd_idx" ON "consultation_diagnoses" USING btree ("icd11_code");--> statement-breakpoint
CREATE INDEX "consultation_diagnoses_gdrg_idx" ON "consultation_diagnoses" USING btree ("g_drg_code");--> statement-breakpoint
CREATE INDEX "consultation_referrals_encounter_idx" ON "consultation_referrals" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "consultations_encounter_idx" ON "consultations" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "consultations_clinician_idx" ON "consultations" USING btree ("clinician_user_id");--> statement-breakpoint
CREATE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "dispensations_prescription_item_idx" ON "dispensations" USING btree ("prescription_item_id");--> statement-breakpoint
CREATE INDEX "encounter_transitions_encounter_idx" ON "encounter_transitions" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "encounters_patient_idx" ON "encounters" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "encounters_status_idx" ON "encounters" USING btree ("status","current_stage");--> statement-breakpoint
CREATE INDEX "encounters_opened_at_idx" ON "encounters" USING btree ("opened_at");--> statement-breakpoint
CREATE INDEX "insurance_verifications_encounter_idx" ON "insurance_verifications" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "insurance_verifications_policy_idx" ON "insurance_verifications" USING btree ("patient_insurance_id");--> statement-breakpoint
CREATE INDEX "laboratory_order_items_order_idx" ON "laboratory_order_items" USING btree ("laboratory_order_id");--> statement-breakpoint
CREATE INDEX "laboratory_order_items_test_idx" ON "laboratory_order_items" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "laboratory_orders_encounter_idx" ON "laboratory_orders" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "laboratory_orders_status_idx" ON "laboratory_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "laboratory_results_item_idx" ON "laboratory_results" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "laboratory_results_parameter_idx" ON "laboratory_results" USING btree ("parameter_id");--> statement-breakpoint
CREATE INDEX "laboratory_test_parameters_test_idx" ON "laboratory_test_parameters" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "laboratory_tests_name_idx" ON "laboratory_tests" USING btree ("name");--> statement-breakpoint
CREATE INDEX "medication_administrations_admission_idx" ON "medication_administrations" USING btree ("admission_id");--> statement-breakpoint
CREATE INDEX "medicines_generic_name_idx" ON "medicines" USING btree ("generic_name");--> statement-breakpoint
CREATE INDEX "nursing_notes_admission_idx" ON "nursing_notes" USING btree ("admission_id");--> statement-breakpoint
CREATE INDEX "patient_insurances_patient_idx" ON "patient_insurances" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_insurances_member_idx" ON "patient_insurances" USING btree ("member_number");--> statement-breakpoint
CREATE INDEX "patients_hospital_number_idx" ON "patients" USING btree ("hospital_number");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "patients_phone_idx" ON "patients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "payment_recipients_staff_idx" ON "payment_recipients" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "payments_encounter_idx" ON "payments" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "payments_patient_idx" ON "payments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "permissions_module_id_idx" ON "permissions" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "prescription_items_prescription_idx" ON "prescription_items" USING btree ("prescription_id");--> statement-breakpoint
CREATE INDEX "prescription_items_medicine_idx" ON "prescription_items" USING btree ("medicine_id");--> statement-breakpoint
CREATE INDEX "prescriptions_encounter_idx" ON "prescriptions" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "prescriptions_status_idx" ON "prescriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "staff_user_id_idx" ON "staff" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_department_id_idx" ON "staff" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "user_access_roles_role_id_idx" ON "user_access_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "vitals_encounter_idx" ON "vitals" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "vitals_recorded_at_idx" ON "vitals" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "ward_beds_ward_idx" ON "ward_beds" USING btree ("ward_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");