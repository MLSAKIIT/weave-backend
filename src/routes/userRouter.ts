import { Hono } from "hono";
import { sign } from "hono/jwt";

import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import db from "../db/index";
import { tokensTable, usersTable } from "../db/schema";

import { eq } from "drizzle-orm";
import { sendEMail } from "../lib/mailer";

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
    //creating token
    const token = await Bun.password.hash(`${email}-${Date.now()}`);
    try {
        await db.insert(usersTable).values({
            fullName,
            email,
            passwordHash: hashedPassword,
        });
        //sending email
        sendEMail(email, token);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); 

        await db.insert(tokensTable).values({
            token,
            email,
            expiresAt,
        });

        return c.json({ message: "User signed up successfully" });
    } catch (e) {
        console.error("Database error:", e);
        c.status(500);
        return c.json({ error: "Error creating user" });
    }
});

// verify email
userRouter.get("/verify-email", async (c) => {
    const token = c.req.query('token') as string;
    const email = c.req.query('email') as string;
    console.log('Received Token:', token); 
    console.log('Received Email:', email);

    if (!token) {
        return c.json({ message: 'Token is required' }, 400);
    }

    if (!email) {
        return c.json({ message: 'Email is required' }, 400);
    }

    try {
        const tokenRecordQuery = db.select().from(tokensTable).where(eq(tokensTable.token, token)).limit(1);
        const tokenRecord = (await tokenRecordQuery)[0];


        if (!tokenRecord) {
            return c.json({ message: 'Invalid token' }, 401);
        }

        if (tokenRecord.expiresAt && new Date(tokenRecord.expiresAt) < new Date()) {
            return c.json({ message: 'Token expired' }, 400);
        }
        
        //delete
        await db.delete(tokensTable).where(eq(tokensTable.token, token));
        
        return c.json({ message: 'Token verified and invalidated successfully' });
    } catch (e) {
        console.error("Database error:", e);
        return c.json({ error: "Error verifying token" }, 500);
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

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);//authenticating jwt token
        return c.json({ token: jwt });
    } catch (e) {
        console.error("Sign-in error:", e);
        c.status(500);
        return c.json({ error: "Error signing in" });
    }
});
