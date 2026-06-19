ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'registry'::text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'registry', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'accounts', 'ward_manager');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'registry'::"public"."role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";