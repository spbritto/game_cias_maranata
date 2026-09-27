ALTER TABLE "game" DROP CONSTRAINT "game_teacher_id_teacher_id_fk";
--> statement-breakpoint
ALTER TABLE "game" ALTER COLUMN "teacher_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "updated_by_id" uuid;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "lesson_date" date;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "lesson_number" smallint;--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_updated_by_id_teacher_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."teacher"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE set null ON UPDATE no action;