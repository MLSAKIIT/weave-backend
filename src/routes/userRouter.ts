import { Hono } from "hono";
import { sign } from "hono/jwt";

import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import db from "../db/index";
import { usersTable } from "../db/schema";

import { eq } from "drizzle-orm";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();
// signUp and signIn schemas
const signUpSchema = z.object({
    fullName: z.string().min(1, "Name cannot be empty"),
    email: z.string().email().min(1, "Email cannot be empty"),
    password: z.string().min(1, "Password cannot be empty"),
});

const signInSchema = z.object({
    email: z.string().email().min(1, "Email cannot be empty"),
    password: z.string().min(1, "Password cannot be empty"),
});
//signUp route
userRouter.post("/signUp", zValidator("json", signUpSchema), async (c) => {
    const { fullName, email, password } = await c.req.valid("json");
    const hashedPassword = await Bun.password.hash(password);//hashing password

    try {
        await db.insert(usersTable).values({
            fullName,
            email,
            passwordHash: hashedPassword,
        });

        return c.json({ message: "User signed up successfully" });
    } catch (e) {
        console.error("Database error:", e);
        c.status(500);
        return c.json({ error: "Error creating user" });
    }
});
//signIn route
userRouter.post("/signIn", zValidator("json", signInSchema), async (c) => {
    const { email, password } = await c.req.valid("json");

    try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

        if (!user) {
            c.status(403);
            return c.json({ error: "Invalid credentials" });
        }

        const validPassword = await Bun.password.verify(password, user.passwordHash);//verifying password
        if (!validPassword) {
            c.status(403);
            return c.json({ error: "Invalid credentials" });
        }

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);//authenticating jwt token (I hardcoded this because there was some issue in accessing the environmental variable)
        return c.json({ token: jwt });
    } catch (e) {
        console.error("Sign-in error:", e);
        c.status(500);
        return c.json({ error: "Error signing in" });
    }
});
