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
    const task="verification"
    const token =await sign({ email }, Bun.env.JWT_SECRET as string);
    try {
        await db.insert(usersTable).values({
            fullName,
            email,
            passwordHash: hashedPassword,
            verified: false
        });
        //sending email
        sendEMail(email, token, task);
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
        
        const [user]=await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        if(!user)return c.json({message: "User not found"}, 404)
        await db.update(usersTable)
    .set({verified: true})  //verified the user
    .where(eq(usersTable.email, email))
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
    const token =await sign({ email }, Bun.env.JWT_SECRET as string);
    const task="verification"
    try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

        if (!user) {
            c.status(403);
            return c.json({ error: "Invalid credentials" });
        }

        if(!user.verified){
            sendEMail(email, token, task)
            return c.json({ message: 'Email not verified. Please check your email for verification link.' });
        }

        const validPassword = await Bun.password.verify(password, user.passwordHash);//verifying password
        if (!validPassword) {
            c.status(403);
            return c.json({ error: "Invalid credentials" });
        }

        const jwt = await sign({ id: user.id }, Bun.env.JWT_SECRET as string);
        c.header("Set-Cookie", `auth_token=${jwt}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`);
        return c.json({ message: "Login successful" },200);
    } catch (e) {
        console.error("Sign-in error:", e);
        c.status(500);
        return c.json({ error: "Error signing in" });
    }
});

userRouter.post("/forgot-password",async(c)=>{
    try{
        const { email } = await c.req.json();
        console.log(email)
        if(!email)return c.json({error: "Email is required"});
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)
        if(!user)return c.json({error: "User not found"});
        const token =await sign({ email }, Bun.env.JWT_SECRET as string);
        const task="Password Reset"
        sendEMail(email,token,task)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); 

        await db.insert(tokensTable).values({
            token,
            email,
            expiresAt,
        });
        return c.json({message: "Password reset link sent to your email."})
    }catch{
        return c.json({message: "Error sending email"});
    }
})