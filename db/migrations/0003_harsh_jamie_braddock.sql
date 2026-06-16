CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"activity_id" uuid,
	"name" text NOT NULL,
	"legal_name" text,
	"industry" text,
	"email" text,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"country" text,
	"status" "client_status" DEFAULT 'prospect' NOT NULL,
	"source" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"activity_id" uuid,
	"company_id" uuid,
	"first_name" text,
	"last_name" text,
	"full_name" text NOT NULL,
	"job_title" text,
	"department" text,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"linkedin_url" text,
	"status" "client_status" DEFAULT 'prospect' NOT NULL,
	"source" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_workspace_id_idx" ON "companies" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "companies_created_by_idx" ON "companies" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "companies_activity_id_idx" ON "companies" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "companies_status_idx" ON "companies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "companies_email_idx" ON "companies" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contacts_workspace_id_idx" ON "contacts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "contacts_created_by_idx" ON "contacts" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "contacts_activity_id_idx" ON "contacts" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "contacts_company_id_idx" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "contacts_status_idx" ON "contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contacts_phone_idx" ON "contacts" USING btree ("phone");