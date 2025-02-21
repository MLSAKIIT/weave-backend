import { Context, Next } from "hono";
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';

export const cookieVerificationMiddleware = async (c: Context, next: Next) => {
    const cookieToken = getCookie(c, 'token') || '';

    if (!cookieToken) {
        return c.json({ error: "No token found in cookies" },403);
    }

    try {
        const user = await verify(cookieToken, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", String(user.id));
            await next();
        } else {
            return c.json({ error: "Invalid token" },403);
        }
    } catch (e) {
        return c.json({ error: "Token verification failed" }, 403);
    }
};