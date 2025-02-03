

import { Request, Response } from "express";
import * as bcryptjs from 'bcryptjs';
import db from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import * as nodemailer from 'nodemailer';
import { Context } from "hono";

export const signUp = async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const hashedToken = await bcryptjs.hash(email, 10);

        await db.insert(usersTable).values({
            fullName,
            email,
            passwordHash: hashedPassword,
            verificationToken: hashedToken,
            verificationTokenExpiry: new Date(Date.now() + 3600000) // 1 hour from now
        });

        console.log('User created and verification token generated');

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "Bun.env.MAIL_USERNAME",
                pass: "Bun.env.MAIL_PASSWORD"
            }
        });

        const mailOptions = {
            from: 'mlsa@gmail.com',
            to: email,
            subject: 'Verify your email',
            html: `<p>Please verify your email by clicking the following link:</p><a href="http://localhost:3000/verify-email?token=${hashedToken}">Verify Email</a>`
        };

        await transport.sendMail(mailOptions);

        res.status(201).json({ message: 'User created. Please check your email to verify your account.' });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyEmail = async (c: Context) => {
    const token = c.req.query('token') as string;
    console.log('Received Token:', token); // Log the received token

    try {
        const user = (await db.select().from(usersTable).where(eq(usersTable.verificationToken, token)).limit(1))[0];
        if (!user) {
            return c.json({ message: 'Invalid token' }, 401);
        }

        if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
            return c.json({ message: 'Token expired' }, 400);
        }

        await db.update(usersTable)
            .set({
                verificationToken: null,
                verificationTokenExpiry: null
            })
            .where(eq(usersTable.verificationToken, token));

        return c.json({ message: 'Email verified successfully' }, 200);
    } catch (error) {
        console.error('Error verifying email:', error);
        return c.json({ message: 'Internal server error' }, 500);
    }
};