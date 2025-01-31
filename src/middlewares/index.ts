import { Hono } from "hono";
import { verify } from 'hono/jwt'

export const router = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();


// Middleware for authenticating user's jwt token and setting userId in context variable for future use in routes 

router.use('/*', async (c, next) => {
    const authHeader = c.req.header('Authorization') || '';
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", String(user.id));
            await next();
        }
        else {
            c.status(403);
            return c.json({
                error: "You are not logged in"
            })
        }
    } catch (e) {
        c.status(403);
        return c.json({
            error: "You are not logged in"
        })
    }
});