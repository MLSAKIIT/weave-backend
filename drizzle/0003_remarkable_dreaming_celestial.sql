CREATE TABLE "tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "tokens_token_unique" UNIQUE("token"),
	CONSTRAINT "tokens_email_unique" UNIQUE("email")
);
