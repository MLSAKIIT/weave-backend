import { Context, Next } from "hono";
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';

export const authMiddleware = async (c: Context, next: Next) => {
    const authToken = c.req.header('Authorization')?.replace('Bearer ', '') || '' ;
    const cookieToken = getCookie(c, 'token') || '';

    if (!authToken && !cookieToken) {
        return c.json({ error: "No token found" }, 403);
    }

    try {
        const token = authToken || cookieToken;
        const user = await verify(token, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", String(user.id));
            await next();
        } else {
            return c.json({ error: "Invalid token" }, 403);
        }
    } catch (e) {
        return c.json({ error: "Token verification failed" }, 403);
    }
};