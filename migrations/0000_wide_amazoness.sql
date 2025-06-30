CREATE TABLE "earnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"amount" numeric(10, 6) NOT NULL,
	"refresh_interval" integer NOT NULL,
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"current_url" text,
	"refresh_count" integer DEFAULT 0,
	"scroll_count" integer DEFAULT 0,
	"auto_scroll_enabled" boolean DEFAULT false,
	"auto_refresh_enabled" boolean DEFAULT false,
	"refresh_interval" integer DEFAULT 30,
	"last_refresh" timestamp,
	"last_scroll" timestamp,
	"is_active" boolean DEFAULT false,
	"session_start_time" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"total_earnings" numeric(10, 6) DEFAULT '0.000000',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;