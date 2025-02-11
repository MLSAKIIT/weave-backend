import { Hono } from "hono";
import { cors } from "hono/cors";
import { userRouter } from "./routes/userRouter";
import authRouter from "./routes/authRouter";

const app = new Hono();


app.use(
  "/*",
  cors({
    origin: "http://localhost:4000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);



app.route("/api/v1/user", userRouter);
app.route("/api/v1/auth", authRouter);

export default app;
