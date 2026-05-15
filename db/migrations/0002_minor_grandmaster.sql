CREATE TYPE "public"."social_channel_provider" AS ENUM('manual', 'webhook');--> statement-breakpoint
CREATE TYPE "public"."social_channel_status" AS ENUM('draft', 'connected', 'attention', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."social_delivery_status" AS ENUM('draft', 'scheduled', 'processing', 'published', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "social_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"platform" "social_platform" DEFAULT 'other' NOT NULL,
	"provider" "social_channel_provider" DEFAULT 'manual' NOT NULL,
	"status" "social_channel_status" DEFAULT 'draft' NOT NULL,
	"name" text NOT NULL,
	"handle" text,
	"webhook_url" text,
	"auth_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"external_account_id" text,
	"auto_publish" boolean DEFAULT false NOT NULL,
	"last_validated_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_post_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"channel_id" uuid,
	"platform" "social_platform" DEFAULT 'other' NOT NULL,
	"caption_override" text,
	"hashtags_override" text,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"status" "social_delivery_status" DEFAULT 'draft' NOT NULL,
	"external_post_id" text,
	"external_url" text,
	"last_error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"leads_generated" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_post_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"brief" text,
	"objective" text,
	"audience" text,
	"tone" text,
	"call_to_action" text,
	"ai_prompt" text,
	"ai_model" text,
	"ai_generated_at" timestamp with time zone,
	"auto_publish" boolean DEFAULT false NOT NULL,
	"approval_notes" text,
	"content_score" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "social_channels" ADD CONSTRAINT "social_channels_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_channels" ADD CONSTRAINT "social_channels_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_deliveries" ADD CONSTRAINT "social_post_deliveries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_deliveries" ADD CONSTRAINT "social_post_deliveries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_deliveries" ADD CONSTRAINT "social_post_deliveries_post_id_social_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_deliveries" ADD CONSTRAINT "social_post_deliveries_channel_id_social_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."social_channels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_details" ADD CONSTRAINT "social_post_details_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_details" ADD CONSTRAINT "social_post_details_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post_details" ADD CONSTRAINT "social_post_details_post_id_social_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."social_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "social_channels_workspace_name_unique" ON "social_channels" USING btree ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "social_channels_workspace_id_idx" ON "social_channels" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "social_channels_created_by_idx" ON "social_channels" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "social_channels_platform_idx" ON "social_channels" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "social_channels_provider_idx" ON "social_channels" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "social_channels_status_idx" ON "social_channels" USING btree ("status");--> statement-breakpoint
CREATE INDEX "social_channels_auto_publish_idx" ON "social_channels" USING btree ("auto_publish");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_workspace_id_idx" ON "social_post_deliveries" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_created_by_idx" ON "social_post_deliveries" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_post_id_idx" ON "social_post_deliveries" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_channel_id_idx" ON "social_post_deliveries" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_platform_idx" ON "social_post_deliveries" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_status_idx" ON "social_post_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_scheduled_at_idx" ON "social_post_deliveries" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_published_at_idx" ON "social_post_deliveries" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "social_post_deliveries_next_retry_at_idx" ON "social_post_deliveries" USING btree ("next_retry_at");--> statement-breakpoint
CREATE UNIQUE INDEX "social_post_details_post_id_unique" ON "social_post_details" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "social_post_details_workspace_id_idx" ON "social_post_details" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "social_post_details_created_by_idx" ON "social_post_details" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "social_post_details_auto_publish_idx" ON "social_post_details" USING btree ("auto_publish");--> statement-breakpoint
CREATE INDEX "social_post_details_ai_generated_at_idx" ON "social_post_details" USING btree ("ai_generated_at");
