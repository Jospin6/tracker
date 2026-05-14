CREATE TABLE "activity_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_clients" ADD CONSTRAINT "activity_clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "activity_clients" ADD CONSTRAINT "activity_clients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "activity_clients" ADD CONSTRAINT "activity_clients_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "activity_clients" ADD CONSTRAINT "activity_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "activity_clients_activity_client_unique" ON "activity_clients" USING btree ("activity_id","client_id");
--> statement-breakpoint
CREATE INDEX "activity_clients_workspace_id_idx" ON "activity_clients" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "activity_clients_created_by_idx" ON "activity_clients" USING btree ("created_by");
--> statement-breakpoint
CREATE INDEX "activity_clients_activity_id_idx" ON "activity_clients" USING btree ("activity_id");
--> statement-breakpoint
CREATE INDEX "activity_clients_client_id_idx" ON "activity_clients" USING btree ("client_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "project_clients_project_client_unique" ON "project_clients" USING btree ("project_id","client_id");
--> statement-breakpoint
CREATE INDEX "project_clients_workspace_id_idx" ON "project_clients" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "project_clients_created_by_idx" ON "project_clients" USING btree ("created_by");
--> statement-breakpoint
CREATE INDEX "project_clients_project_id_idx" ON "project_clients" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX "project_clients_client_id_idx" ON "project_clients" USING btree ("client_id");
