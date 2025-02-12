import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import db from "../db";
import { tokensTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import {getCookie} from 'hono/cookie'
const authRouter = new Hono();


const resetPasswordSchema = z.object({
    token: z.string().nonempty("Reset token is required."),
    newPassword: z.string().nonempty("Password cannot be empty."),
    confirmPassword: z.string().nonempty("Password must be confirmed.")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ["confirmPassword"]
})

authRouter.get("/check-auth", async (c) => {
    const authToken = getCookie(c,"auth_token");
    console.log(authToken)
    if (!authToken) {
      return c.json({ authenticated: false, message: "No auth token found" }, 401);
    }
  
    return c.json({ authenticated: true, message: "User is authenticated" });
  });
  

authRouter.post('/reset-password', zValidator("json", resetPasswordSchema), async (c) => {

    const { token, newPassword } = c.req.valid("json")

    try {
        const [resetTokenData] = await db.select({ email: tokensTable.email, expiresAt: tokensTable.expiresAt }).from(tokensTable).where(eq(tokensTable.token, token)).limit(1)

        if (!resetTokenData) {
            return c.json({ message: "Invalid reset token." }, 401)
        }

        if (new Date(resetTokenData.expiresAt) < new Date()) {
            await db.delete(tokensTable).where(eq(tokensTable.token, token))
            return c.json({ message: "Reset token expired." }, 400)
        }

        const newPasswordHash = await Bun.password.hash(newPassword)

        await db.transaction(async (tx) => {
            await tx.update(usersTable)
                .set({ passwordHash: newPasswordHash })
                .where(eq(usersTable.email, resetTokenData.email))

            await tx.delete(tokensTable)
                .where(eq(tokensTable.token, token))

        })

        return c.json({ message: 'Password changed successfully.' }, 200)
    }
    catch (err) {
        console.error('Database operation error : ', err)
        return c.json({ message: 'Internal Server Error.', error: err }, 500)
    }

})

export default authRouter