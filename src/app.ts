import { Hono } from "hono";
import { cors } from "hono/cors";
import { userRouter } from "./routes/userRouter";
import authRouter from "./routes/authRouter";
import { upgradeWebSocket } from "./server";
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

app.get('/ws',upgradeWebSocket((c)=>{
  console.log('User Connected')
  return{
    onMessage(event, ws){
      console.log(`Message from client: ${event.data}`)
      ws.send('Hello from server')
    },
    onClose:()=>{
      console.log('Connection closed!')
    }
  }
}))

app.route("/api/v1/user", userRouter);
app.route("/api/v1/auth", authRouter);

export default app;
