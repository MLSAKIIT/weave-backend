import { Hono } from "hono";
import { sign } from "hono/jwt";

import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import db from "../db/index";
import { usersTable } from "../db/schema";
import * as bcryptjs from 'bcryptjs';
import * as nodemailer from 'nodemailer';

import { eq } from "drizzle-orm";

// Route imports

import { signUp, verifyEmail } from "../controllers/userController";

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
    const hashedToken = await bcryptjs.hash(email, 10);

    console.log("Hashed token:", hashedToken);
    

    try {
        await db.insert(usersTable).values({
            fullName,
            email,
            passwordHash: hashedPassword,
            verificationToken: hashedToken,
            verificationTokenExpiry: new Date(Date.now() + 3600000) // 1 hour from now
        });

        // Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9167ce5cb37411",
      pass: "71ef912b7cb960"
    }
  });



        const mailOptions = {
            from: 'mlsa@gmail.com',
            to: email,
            subject: 'Verify your email',
            html: `<p>Please verify your email by clicking the following link:</p><a href="http://localhost:3000/verify-email?token=${hashedToken}">Verify Email</a>`
        };

        await transport.sendMail(mailOptions);

        return c.json({ message: "User signed up successfully and verification token generated" });
    } catch (e: any) {
        console.error("Database error:", e);
        c.status(500);
        return c.json({ error: "Error creating user", details: e.message });
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



userRouter.post("/verify-email", verifyEmail);
