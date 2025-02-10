-- Custom SQL migration file, put your code below! --
--
-- NOTE: drizzle does'nt support serial in ALTER TABLE
DROP TABLE IF EXISTS "users";
CREATE TABLE "users" (
    "id" serial PRIMARY KEY,
    "full_name" text NOT NULL,
    "email" text NOT NULL,
    "password_hash" text NOT NULL,
    "avatar_url" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
